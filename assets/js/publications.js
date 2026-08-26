(function(){
'use strict';
const state={items:[],filter:'All',query:'',sort:'newest'};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const safeUrl=value=>{try{const u=new URL(value,location.href);return /^https?:$/.test(u.protocol)?u.href:'#';}catch{return '#';}};
function visible(){let rows=state.items.filter(x=>{const f=state.filter==='All'||x.type===state.filter||(state.filter==='Open Access'&&x.openAccess);const hay=`${x.title} ${x.authors} ${x.venue} ${(x.topics||[]).join(' ')} ${x.year}`.toLowerCase();return f&&hay.includes(state.query.toLowerCase());});return rows.sort((a,b)=>state.sort==='oldest'?a.year-b.year:state.sort==='title'?a.title.localeCompare(b.title):b.year-a.year);}
function render(){
 const rows=visible();$('#pubCount').textContent=rows.length;$('#pubEmpty').hidden=rows.length>0;
 $('#pubList').innerHTML=rows.map((x,i)=>`<article class="pub-record">
   <div class="pub-year"><strong>${x.year}</strong><span>${esc(x.type)}</span></div>
   <div class="pub-body">
    <div class="pub-title-wrap"><a class="pub-title" href="${safeUrl(x.url)}" target="_blank" rel="noopener" aria-describedby="tldr-${i}">${esc(x.title)} <span aria-hidden="true">↗</span></a><div class="pub-tldr" id="tldr-${i}" role="tooltip"><strong>TL;DR</strong><p>${esc(x.tldr)}</p></div></div>
    <p class="pub-authors">${esc(x.authors)}</p><p class="pub-venue">${esc(x.venue)}${x.doi?` · DOI: ${esc(x.doi)}`:''}</p>
    <div class="pub-topics">${(x.topics||[]).map(t=>`<span>${esc(t)}</span>`).join('')}${x.openAccess?'<span class="open-tag">Open access</span>':''}</div>
    <details class="citation-details"><summary>Bibliography entry</summary><div><p>${esc(x.citation)}</p><button class="copy-citation" data-id="${esc(x.id)}">Copy citation</button></div></details>
   </div></article>`).join('');
 document.querySelectorAll('.copy-citation').forEach(btn=>btn.addEventListener('click',()=>copyText(state.items.find(x=>x.id===btn.dataset.id)?.citation||'')));
}
function copyText(value){navigator.clipboard.writeText(value).then(()=>toast('Citation copied')).catch(()=>toast('Select and copy the citation manually'));}
function toast(message){const el=$('#copyToast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800);}
function renderDashboard(data){
 const m=data.metrics;$('#citationMetric').textContent=m.citations;$('#hMetric').textContent=m.hIndex;$('#i10Metric').textContent=m.i10Index;$('#outputMetric').textContent=data.items.length;
 $('#profileLinks').innerHTML=data.profiles.map(x=>`<a class="btn" href="${safeUrl(x.url)}"${x.local?'': ' target="_blank" rel="noopener noreferrer"'}>${esc(x.label)} ${x.local?'→':'↗'}</a>`).join('');
 const years={};data.items.forEach(x=>years[x.year]=(years[x.year]||0)+1);const max=Math.max(...Object.values(years));$('#yearBars').innerHTML=Object.entries(years).sort((a,b)=>a[0]-b[0]).map(([year,count])=>`<div><i style="height:${12+count/max*50}px"></i><b>${count}</b><span>${String(year).slice(2)}</span></div>`).join('');
 const buckets={'AI / ML / DL':['Machine Learning','Deep Learning','Transfer Learning','CNN','NLP','Sentiment Analysis'],'Information Systems':['Information Systems','Cloud Computing','Docker','Knowledge Management'],'Business & Society':['Business Analytics','Crowdfunding','Retail','Sales','Customer Behavior','Econometrics','STEM Policy','Predictive Analytics','Student Retention'],'Healthcare':['Healthcare','Medical Imaging','Student Mental Health']};const counts={};for(const [name,tags] of Object.entries(buckets))counts[name]=data.items.filter(x=>x.topics?.some(t=>tags.includes(t))).length;const total=Math.max(...Object.values(counts));$('#topicMap').innerHTML=Object.entries(counts).map(([name,count])=>`<div><span>${name}</span><i><b style="width:${count/total*100}%"></b></i><strong>${count}</strong></div>`).join('');
}
function bibtex(x){const key=(x.authors.split(';')[0].split(' ').slice(-1)[0]+x.year+x.title.split(/\s+/).slice(0,2).join('')).replace(/\W/g,'');const type=x.type==='Journal'?'article':x.type==='Dissertation'?'phdthesis':'inproceedings';return `@${type}{${key},\n  title={${x.title}},\n  author={${x.authors.replaceAll(';',' and')}},\n  year={${x.year}},\n  booktitle={${x.venue}}${x.doi?`,\n  doi={${x.doi}}`:''},\n  url={${x.url}}\n}`;}
async function init(){
 try{const response=await fetch('data/publications.json');const data=await response.json();state.items=data.items;renderDashboard(data);render();}
 catch{$('#pubList').innerHTML='<div class="notice">The bibliography could not load. Please refresh the page.</div>';}
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===btn));state.filter=btn.dataset.filter;render();}));
 $('#pubSearch').addEventListener('input',e=>{state.query=e.target.value.trim();render();});$('#pubSort').addEventListener('change',e=>{state.sort=e.target.value;render();});
 $('#copyBibliography').addEventListener('click',()=>copyText(visible().map(x=>x.citation).join('\n\n')));
 $('#downloadBib').addEventListener('click',()=>{const blob=new Blob([visible().map(bibtex).join('\n\n')],{type:'application/x-bibtex'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ganga-basyal-publications.bib';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('BibTeX downloaded');});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
