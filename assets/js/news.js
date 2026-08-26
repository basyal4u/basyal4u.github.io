(function(){
'use strict';
const savedKey='basyal-student-signal-saved-v1';
function savedStories(){try{const value=JSON.parse(localStorage.getItem(savedKey)||'[]');return new Set(Array.isArray(value)?value:[]);}catch{return new Set();}}
const state={items:[],topic:'All',query:'',saved:savedStories()};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const safeUrl=value=>{try{const u=new URL(value);return /^https?:$/.test(u.protocol)?u.href:'#';}catch{return '#';}};
const relativeDate=value=>{const days=Math.max(0,Math.floor((Date.now()-new Date(value).getTime())/86400000));return days===0?'Today':days===1?'Yesterday':days<7?`${days} days ago`:new Date(value).toLocaleDateString(undefined,{month:'short',day:'numeric'});};
const matches=item=>{const topic=state.topic==='All'||(state.topic==='Saved'&&state.saved.has(item.id))||item.tags?.includes(state.topic)||item.category===state.topic;const hay=`${item.title} ${item.summary} ${item.source} ${(item.tags||[]).join(' ')}`.toLowerCase();return topic&&hay.includes(state.query.toLowerCase());};
const imageHTML=item=>item.image?`<div class="news-image"><img src="${safeUrl(item.image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>`:'';
function saveButton(item,extra=''){const on=state.saved.has(item.id);return `<button class="save-story ${on?'saved':''}" data-save="${esc(item.id)}" aria-pressed="${on}" aria-label="${on?'Remove from':'Save to'} reading list">${on?'★ Saved':'☆ Save'}${extra}</button>`;}
function card(item){return `<article class="news-card accent-${esc(item.accent)}">${imageHTML(item)}<div class="news-card-body"><div class="news-card-top"><span class="source-mark">${esc(item.source)}</span><span>${relativeDate(item.published)}</span></div><h3><a href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.title)}</a></h3><p>${esc(item.summary)}</p><div class="news-card-foot"><div>${(item.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="news-card-actions">${saveButton(item)}<a href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Read ${esc(item.title)} at ${esc(item.source)}">Read ↗</a></div></div></div></article>`;}
function render(){
 const visible=state.items.filter(matches);$('#newsList').innerHTML=visible.slice(1).map(card).join('');$('#newsEmpty').hidden=visible.length>0;
 const lead=visible[0];$('#leadStory').classList.remove('signal-skeleton');
 $('#leadStory').style.setProperty('--lead-image',lead?.image?`url("${safeUrl(lead.image).replace(/["\\]/g,'')}")`:'none');
 $('#leadStory').classList.toggle('has-image',Boolean(lead?.image));
 $('#leadStory').innerHTML=lead?`<div class="lead-meta"><span>Lead signal</span><span>${esc(lead.source)} · ${relativeDate(lead.published)}</span></div><h2>${esc(lead.title)}</h2><p>${esc(lead.summary)}</p><div class="lead-actions"><div><a class="btn primary" href="${safeUrl(lead.url)}" target="_blank" rel="noopener noreferrer">Read the original ↗</a>${saveButton(lead)}</div><span>${lead.readMinutes||3} min read · ${(lead.tags||[]).map(esc).join(' / ')}</span></div>`:`<h2>No lead story found.</h2><p>Try another topic.</p>`;
 const scan=visible.slice(1,4);$('#quickScan').innerHTML=scan.length?scan.map((x,i)=>`<a href="${safeUrl(x.url)}" target="_blank" rel="noopener"><b>0${i+1}</b><span>${esc(x.title)}</span><small>${esc(x.source)}</small></a>`).join(''):'<p class="small">No additional stories in this signal yet.</p>';
}
function renderPodcast(items){const item=items.find(x=>x.category==='Podcast');$('#podcastPick').innerHTML=item?`<div class="podcast-icon">▶</div><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p><a href="${safeUrl(item.url)}" target="_blank" rel="noopener">Play at ${esc(item.source)} ↗</a>`:`<div class="podcast-icon">◉</div><h3>HBR IdeaCast</h3><p>Management ideas and conversations with leading thinkers.</p><a href="https://hbr.org/podcast/ideacast" target="_blank" rel="noopener">Browse episodes ↗</a>`;}
function renderSources(data){const counts={};data.items.forEach(x=>counts[x.source]=(counts[x.source]||0)+1);$('#sourceDesk').innerHTML=data.sources.map(s=>`<div class="source-chip ${s.status==='ok'?'online':'standby'}"><span>${s.status==='ok'?'●':'○'}</span><div><strong>${esc(s.source)}</strong><small>${s.status==='ok'?`${counts[s.source]||s.items} current signals`:'Feed on standby'}</small></div></div>`).join('');}
async function init(){
 try{const response=await fetch(`data/news.json?v=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw new Error('feed unavailable');const data=await response.json();state.items=data.items||[];const generated=new Date(data.generatedAt);$('#feedStatus').textContent=`${state.items.length} fresh signals`;$('#feedTime').textContent=`Updated ${generated.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})} · ${data.cadence}`;renderPodcast(state.items);renderSources(data);render();}
 catch(error){$('#feedStatus').textContent='Briefing temporarily unavailable';$('#feedTime').textContent='Use the source desk links while the feed reconnects';$('#leadStory').innerHTML='<h2>The signal is reconnecting.</h2><p>Please refresh in a moment.</p>';}
 document.querySelectorAll('[data-topic]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-topic]').forEach(x=>x.classList.toggle('active',x===btn));state.topic=btn.dataset.topic;render();}));
 $('#newsSearch').addEventListener('input',e=>{state.query=e.target.value.trim();render();});
 document.addEventListener('click',e=>{const button=e.target.closest('[data-save]');if(!button)return;const id=button.dataset.save;state.saved.has(id)?state.saved.delete(id):state.saved.add(id);localStorage.setItem(savedKey,JSON.stringify([...state.saved]));render();});
 document.addEventListener('error',e=>{if(e.target.matches?.('.news-image img'))e.target.closest('.news-image').remove();},true);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
