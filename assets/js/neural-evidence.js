(function(){
'use strict';
if(!location.pathname.endsWith('neural-network-tutorial.html')) return;
const $=id=>document.getElementById(id);
const KEY='badm201_nn_evidence_v1';
const state=load();
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{student:'',runs:[],notes:{},checks:{},started:new Date().toISOString()}}catch(e){return{student:'',runs:[],notes:{},checks:{},started:new Date().toISOString()}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));renderStatus()}
function value(id){const el=$(id);return el?el.value:''}
function text(id){const el=$(id);return el?el.textContent.trim():''}
function snapshot(label){
 const run={time:new Date().toLocaleString(),label,
  ad:value('adInput'),interest:value('interestInput'),price:value('priceInput'),
  lr:value('lrInput'),threshold:value('thresholdInput'),
  probability:text('probability'),loss:text('lossOut'),epoch:text('epochOut'),mode:text('modeBadge'),
  h1:text('h1Out'),h2:text('h2Out'),decision:text('decisionText')};
 state.runs.push(run); if(state.runs.length>30)state.runs.shift();save();renderRuns();return run;
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function inject(){
 const target=document.querySelector('.nn-questions'); if(!target)return;
 const section=document.createElement('section');section.id='evidence-panel';section.style.cssText='padding:55px 0;background:#eef5fb;border-top:1px solid #cbd9e8;border-bottom:1px solid #cbd9e8';
 section.innerHTML=`<div class="container"><div class="section-head"><div><div class="kicker">Completion + evidence</div><h2>Build your D2L evidence summary</h2></div><p>Your work is saved only in this browser. Record experiments as you go, add brief observations, then export a compact summary for D2L.</p></div>
 <div style="display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);gap:20px;align-items:start" class="nn-evidence-grid">
  <div class="nn-card"><h3>1 · Student + experiment evidence</h3><label style="display:block;font-weight:800;margin-bottom:14px">Name or DSU identifier <input id="evStudent" value="${esc(state.student)}" placeholder="Enter your name or course identifier" style="display:block;width:100%;margin-top:7px;padding:11px;border:1px solid #cbd9e8;border-radius:9px"></label>
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="nn-btn primary" id="evRecord">Record current run</button><button class="nn-btn" id="evSlow">Record slow-rate experiment</button><button class="nn-btn" id="evFast">Record high-rate experiment</button><button class="nn-btn" id="evInference">Record inference test</button></div>
   <div id="evRuns" style="margin-top:16px"></div>
  </div>
  <aside class="nn-card"><h3>Completion status</h3><div id="evStatus"></div><div style="height:10px;background:#dce7f1;border-radius:99px;overflow:hidden;margin:14px 0"><div id="evBar" style="height:100%;background:#0b5fad;width:0%;transition:.3s"></div></div><strong id="evPercent">0% complete</strong><p class="nn-mini">Completion is a self-check, not a grade. Your instructor may require screenshots or additional D2L responses.</p></aside>
 </div>
 <div class="nn-card" style="margin-top:20px"><h3>2 · Required observations</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px" class="nn-observation-grid">
 ${obs('slow','Slow learning rate (η = 0.001)','What happened to loss and prediction after training?')}
 ${obs('fast','High learning rate (η = 1.0)','Did the loss decrease smoothly, jump, or become unstable?')}
 ${obs('threshold','Decision threshold','What changed when you compared 30%, 50%, and 80% thresholds?')}
 ${obs('customer','Competing customer signals','Describe a customer whose engagement and price sensitivity pull the prediction in different directions.')}
 ${obs('inference','Training vs. inference','What changed during inference, and what stayed fixed?')}
 ${obs('manager','Manager explanation','Explain how the network learns without using the phrase “artificial intelligence.”')}
 </div></div>
 <div class="nn-card" style="margin-top:20px"><h3>3 · Generate submission summary</h3><p>The summary includes your recorded settings/results and your own observations. Review it before submitting.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="nn-btn primary" id="evGenerate">Generate summary</button><button class="nn-btn" id="evCopy">Copy summary</button><button class="nn-btn" id="evDownload">Download .txt</button><button class="nn-btn" id="evClear">Clear saved evidence</button></div><textarea id="evSummary" rows="18" style="width:100%;margin-top:14px;padding:13px;border:1px solid #cbd9e8;border-radius:10px;font:14px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace" placeholder="Your D2L-ready evidence summary will appear here."></textarea></div>
 </div>`;
 target.insertAdjacentElement('beforebegin',section);
 const css=document.createElement('style');css.textContent='@media(max-width:850px){.nn-evidence-grid,.nn-observation-grid{grid-template-columns:1fr!important}}';document.head.appendChild(css);
 bind();renderRuns();renderStatus();
}
function obs(key,title,prompt){return `<label style="display:block;font-weight:800">${title}<span class="nn-mini" style="display:block;font-weight:500;margin:4px 0 7px">${prompt}</span><textarea data-ev-note="${key}" rows="5" style="width:100%;padding:11px;border:1px solid #cbd9e8;border-radius:9px">${esc(state.notes[key]||'')}</textarea></label>`}
function bind(){
 $('evStudent').addEventListener('input',e=>{state.student=e.target.value;save()});
 document.querySelectorAll('[data-ev-note]').forEach(t=>t.addEventListener('input',e=>{state.notes[e.target.dataset.evNote]=e.target.value;save()}));
 $('evRecord').onclick=()=>snapshot('Current run');
 $('evSlow').onclick=()=>{state.checks.slow=true;snapshot('Slow learning rate η='+value('lrInput'));};
 $('evFast').onclick=()=>{state.checks.fast=true;snapshot('High learning rate η='+value('lrInput'));};
 $('evInference').onclick=()=>{state.checks.inference=true;snapshot('Inference-mode check');};
 $('evGenerate').onclick=()=>{$('evSummary').value=summary();state.checks.generated=true;save()};
 $('evCopy').onclick=async()=>{if(!$('evSummary').value)$('evSummary').value=summary();try{await navigator.clipboard.writeText($('evSummary').value);$('evCopy').textContent='Copied ✓';setTimeout(()=>$('evCopy').textContent='Copy summary',1500)}catch(e){$('evSummary').select();document.execCommand('copy')}};
 $('evDownload').onclick=()=>{const s=$('evSummary').value||summary(),blob=new Blob([s],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='BADM201_Neural_Network_Lab_Evidence.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
 $('evClear').onclick=()=>{if(confirm('Clear the neural-network lab evidence saved in this browser?')){localStorage.removeItem(KEY);location.reload()}};
 hookExperiments();
}
function hookExperiments(){
 const map=[['slowLR','slow'],['fastLR','fast'],['toggleMode','inference']];map.forEach(([id,key])=>{const b=$(id);if(b)b.addEventListener('click',()=>{state.checks[key]=true;save()})});
 const th=$('thresholdInput');if(th)th.addEventListener('input',()=>{const v=+th.value;if(v<=.31||v>=.79)state.checks.threshold=true;save()});
 ['adInput','interestInput','priceInput'].forEach(id=>{const el=$(id);if(el)el.addEventListener('input',()=>{state.checks.customer=true;save()})});
 ['trainOne','trainEpoch','train20'].forEach(id=>{const b=$(id);if(b)b.addEventListener('click',()=>{state.checks.trained=true;setTimeout(()=>{snapshot('Training action: '+b.textContent.trim())},80)})});
}
function renderRuns(){const box=$('evRuns');if(!box)return;if(!state.runs.length){box.innerHTML='<p class="nn-mini">No runs recorded yet. Use the lab controls, then record a run.</p>';return}box.innerHTML='<div class="nn-table-wrap"><table class="nn-table"><thead><tr><th>Run</th><th>η</th><th>Threshold</th><th>Prediction</th><th>Loss</th><th>Epoch</th></tr></thead><tbody>'+state.runs.slice(-8).reverse().map(r=>`<tr><td style="text-align:left"><strong>${esc(r.label)}</strong><br><small>${esc(r.time)}</small></td><td>${esc(r.lr)}</td><td>${esc(r.threshold)}</td><td>${esc(r.probability)}</td><td>${esc(r.loss)}</td><td>${esc(r.epoch)}</td></tr>`).join('')+'</tbody></table></div>'}
function requirements(){return[
 ['student',!!state.student.trim(),'Identify your work'],['trained',!!state.checks.trained,'Train the network'],['slow',!!state.checks.slow,'Test a very small learning rate'],['fast',!!state.checks.fast,'Test a high learning rate'],['threshold',!!state.checks.threshold,'Explore decision thresholds'],['customer',!!state.checks.customer,'Change customer inputs'],['inference',!!state.checks.inference,'Switch to inference mode'],['notes',Object.values(state.notes).filter(v=>String(v).trim().length>=15).length>=5,'Write observations'],['runs',state.runs.length>=3,'Record at least 3 runs']];}
function renderStatus(){const box=$('evStatus');if(!box)return;const req=requirements(),done=req.filter(r=>r[1]).length,pct=Math.round(done/req.length*100);box.innerHTML=req.map(r=>`<div style="display:flex;gap:8px;align-items:center;margin:8px 0"><span style="font-weight:900;color:${r[1]?'#137a53':'#7a8997'}">${r[1]?'✓':'○'}</span><span>${esc(r[2])}</span></div>`).join('');$('evBar').style.width=pct+'%';$('evPercent').textContent=pct+'% complete'}
function summary(){
 const latest=state.runs.slice(-8),n=state.notes;
 return `BADM-201 · Chapter 1 Neural Network Lab\nInside a Neural Network: Will the Customer Buy?\n\nStudent: ${state.student||'[not entered]'}\nStarted: ${new Date(state.started).toLocaleString()}\nGenerated: ${new Date().toLocaleString()}\n\nRECORDED EXPERIMENTS\n${latest.length?latest.map((r,i)=>`${i+1}. ${r.label}\n   Inputs: engagement=${r.ad}, product interest=${r.interest}, price sensitivity=${r.price}\n   Learning rate=${r.lr}; threshold=${r.threshold}; mode=${r.mode}\n   Prediction=${r.probability}; loss=${r.loss}; epoch=${r.epoch}; decision=${r.decision}`).join('\n\n'):'No runs recorded.'}\n\nOBSERVATIONS\n1. Slow learning rate (η=.001)\n${n.slow||'[student response not entered]'}\n\n2. High learning rate (η=1.0)\n${n.fast||'[student response not entered]'}\n\n3. Decision threshold\n${n.threshold||'[student response not entered]'}\n\n4. Competing customer signals\n${n.customer||'[student response not entered]'}\n\n5. Training vs. inference\n${n.inference||'[student response not entered]'}\n\n6. Manager explanation\n${n.manager||'[student response not entered]'}\n\nStudent affirmation: The observations above describe my own lab runs and interpretation.`;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();
