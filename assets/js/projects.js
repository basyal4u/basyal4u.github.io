(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const safeUrl=value=>{try{const u=new URL(value,location.href);return /^https?:$/.test(u.protocol)?u.href:'';}catch{return'';}};
function card(x){const url=safeUrl(x.url);return `<article class="card research-project"><div class="eyebrow">${esc(x.eyebrow)}</div><h3>${esc(x.title)}</h3><p>${esc(x.summary)}</p><div class="pub-topics">${(x.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div>${url?`<a class="project-link" href="${url}" target="_blank" rel="noopener noreferrer">View public record ↗</a>`:''}</article>`;}
async function init(){try{const r=await fetch('data/projects.json');if(!r.ok)throw new Error();const data=await r.json();for(const group of ['previous','current','future']){const el=document.getElementById(`${group}Projects`);if(el)el.innerHTML=(data[group]||[]).map(card).join('');}}catch{document.querySelectorAll('[id$="Projects"]').forEach(el=>el.innerHTML='<div class="notice">Research projects are temporarily unavailable.</div>');}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
