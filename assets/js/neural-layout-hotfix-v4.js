(function(){
'use strict';
if(!location.pathname.endsWith('neural-network-tutorial.html')) return;
function fix(){
 const svg=document.getElementById('networkSvg');
 const wrap=document.querySelector('.nn-svg-wrap');
 const btn=document.getElementById('forwardBtn');
 if(!svg||!wrap||!btn)return;
 // Expand the internal coordinate system so labels have a dedicated left gutter.
 svg.setAttribute('viewBox','0 0 900 370');
 svg.style.transform='none';
 svg.style.overflow='visible';
 // Input labels: fixed left gutter, safely separated from nodes.
 const labels=[...svg.querySelectorAll('text.nn-smallsvg')].slice(0,3);
 const ys=[80,180,280];
 labels.forEach((el,i)=>{el.setAttribute('x','18');el.setAttribute('y',String(ys[i]));el.setAttribute('text-anchor','start');el.style.fontSize='12px';});
 // Input nodes and their value labels move right.
 const inputNodeIds=['n-i1','n-i2','n-i3'];
 const inputValueIds=['svgI1','svgI2','svgI3'];
 const inputY=[85,185,285];
 inputNodeIds.forEach((id,i)=>{const el=document.getElementById(id);if(el){el.setAttribute('cx','210');el.setAttribute('cy',String(inputY[i]));}});
 inputValueIds.forEach((id,i)=>{const el=document.getElementById(id);if(el){el.setAttribute('x','210');el.setAttribute('y',String(inputY[i]+5));}});
 // Hidden and output layers move right proportionally for a clean visual map.
 [['n-h1',475,120],['n-h2',475,250],['n-o',760,185]].forEach(([id,x,y])=>{const el=document.getElementById(id);if(el){el.setAttribute('cx',String(x));el.setAttribute('cy',String(y));}});
 [['svgH1',475,125],['svgH2',475,255],['svgO',760,190]].forEach(([id,x,y])=>{const el=document.getElementById(id);if(el){el.setAttribute('x',String(x));el.setAttribute('y',String(y));}});
 // Layer headings.
 const headingTexts=[...svg.querySelectorAll('text.nn-label')].filter(t=>['INPUT LAYER','HIDDEN LAYER','OUTPUT'].includes(t.textContent.trim()));
 headingTexts.forEach(t=>{const v=t.textContent.trim();if(v==='INPUT LAYER')t.setAttribute('x','170');if(v==='HIDDEN LAYER')t.setAttribute('x','425');if(v==='OUTPUT')t.setAttribute('x','725');});
 // Connection geometry.
 const lines={
  'l-i1-h1':[240,85,445,120],'l-i1-h2':[240,85,445,250],
  'l-i2-h1':[240,185,445,120],'l-i2-h2':[240,185,445,250],
  'l-i3-h1':[240,285,445,120],'l-i3-h2':[240,285,445,250],
  'l-h1-o':[505,120,726,185],'l-h2-o':[505,250,726,185]
 };
 Object.entries(lines).forEach(([id,a])=>{const el=document.getElementById(id);if(el){['x1','y1','x2','y2'].forEach((k,j)=>el.setAttribute(k,String(a[j])));}});
 // Weight-label positions.
 const positions={wl11:[295,88],wl12:[302,116],wl21:[315,163],wl22:[315,220],wl31:[315,252],wl32:[312,309],wlo1:[580,132],wlo2:[580,259],biasH:[430,168],biasO:[710,248]};
 Object.entries(positions).forEach(([id,a])=>{const el=document.getElementById(id);if(el){el.setAttribute('x',String(a[0]));el.setAttribute('y',String(a[1]));}});
 // Put the animation button physically inside the visual map.
 let dock=document.getElementById('nnVisualDock');
 if(!dock){dock=document.createElement('div');dock.id='nnVisualDock';dock.style.cssText='position:absolute;right:18px;bottom:16px;z-index:20;display:flex;gap:8px;align-items:center;padding:8px;background:rgba(255,255,255,.94);border:1px solid #cbd9e8;border-radius:12px;box-shadow:0 8px 20px rgba(7,27,51,.16);backdrop-filter:blur(8px)';wrap.appendChild(dock);}
 dock.appendChild(btn);
 btn.style.position='static';btn.style.margin='0';btn.style.right='auto';btn.style.top='auto';btn.style.boxShadow='none';btn.style.border='0';
 // Make the wrapper itself the containing block for the dock.
 wrap.style.position='relative';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(fix,60));else setTimeout(fix,60);
window.addEventListener('resize',()=>setTimeout(fix,40));
})();
