const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const LABS={
 neural:{name:'Neural Network Playground',runs:5,concepts:['hidden unit','activation','learning rate','loss','accuracy','decision boundary','noise','epoch','backpropagation']},
 ml:{name:'k-NN Classification',runs:5,concepts:['neighbor','distance','euclidean','manhattan','vote','query','boundary','local']},
 xai:{name:'What-If Explainable AI',runs:5,concepts:['contribution','threshold','score','feature','causality','fairness','decision']},
 sent:{name:'Sentiment & Language Failure Modes',runs:6,concepts:['sentiment','token','negation','sarcasm','lexicon','context','threshold']},
 gradient:{name:'Gradient Descent',runs:5,concepts:['learning rate','momentum','gradient','loss','convergence','start point','local minimum']},
 clustering:{name:'K-Means Clustering',runs:5,concepts:['centroid','cluster','inertia','initialization','iteration','geometry','k=']}
};
const fileInput=$('#graderFiles'),fileList=$('#graderFileList'),form=$('#graderForm'),results=$('#graderResults');
const today=()=>new Date().toISOString().slice(0,10);

async function digest(value){const bytes=new TextEncoder().encode(value.trim().toLowerCase());const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,20);}
async function attemptKey(){const student=$('#graderStudent').value.trim();if(!student)return null;return `basyal-grader-v1-${await digest(student)}-${$('#graderLab').value}`;}
async function attemptInfo(){const key=await attemptKey();if(!key)return {allowed:false,total:0,today:false,key:null};let dates=[];try{dates=JSON.parse(localStorage.getItem(key)||'[]');}catch{}return {allowed:dates.length<2&&!dates.includes(today()),total:dates.length,today:dates.includes(today()),key,dates};}
async function updateAttemptStatus(){const info=await attemptInfo(),el=$('#attemptStatus');if(!info.key){el.textContent='Maximum 2 checks per assignment · 1 per day';return;}el.textContent=info.total>=2?'Both readiness checks have been used':info.today?'Today’s check is complete — return on another day':`${2-info.total} of 2 checks remaining · one allowed today`;}

function fileSummary(){fileList.innerHTML=[...fileInput.files].map(f=>`<span><b>${esc(f.name)}</b><small>${(f.size/1024).toFixed(0)} KB</small></span>`).join('');}
async function readPdf(file){const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;let text='';for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i),content=await page.getTextContent();text+='\n'+content.items.map(x=>x.str).join(' ');}return text;}
async function readDocx(file){if(!window.mammoth)throw new Error('DOCX reader is still loading. Try again in a moment.');return (await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value;}
async function readFiles(){let text=$('#graderPaste').value||'',csvRows=0,images=0,parsed=[],warnings=[];for(const file of fileInput.files){const ext=file.name.split('.').pop().toLowerCase();try{if(['png','jpg','jpeg'].includes(ext)){images++;parsed.push(file.name);continue;}let value='';if(ext==='pdf')value=await readPdf(file);else if(ext==='docx')value=await readDocx(file);else value=await file.text();if(ext==='csv')csvRows+=Math.max(0,value.trim().split(/\r?\n/).length-1);text+='\n'+value;parsed.push(file.name);}catch(error){warnings.push(`${file.name} could not be read; export it as PDF or paste its text.`);}}return {text,csvRows,images,parsed,warnings};}
function countMatches(text,re){return (text.match(re)||[]).length;}
function evaluate(payload,lab){
 const raw=payload.text,lower=raw.toLowerCase(),cfg=LABS[lab];
 const runMentions=countMatches(lower,/\brun(?:\s+id|\s*#|\s+number)?\s*[:#-]?\s*[a-z0-9-]+/gi);const runEvidence=Math.max(payload.csvRows,runMentions);
 const concepts=cfg.concepts.filter(x=>lower.includes(x));const comparison=countMatches(lower,/\b(compare|compared|comparison|versus|vs\.?|higher|lower|increase|decrease|difference|while|whereas)\b/gi);
 const reasoning=countMatches(lower,/\b(because|therefore|suggests|indicates|explains|resulted|caused|due to|which means)\b/gi);
 const screenshotSignals=payload.images+countMatches(lower,/\b(screenshot|figure\s*\d|image\s*\d|appendix\s*[a-z]?)\b/gi);
 return [
  {group:'Experimental design & completion',label:`At least ${cfg.runs} distinct runs`,pass:runEvidence>=cfg.runs,found:runEvidence? `Detected evidence for about ${runEvidence} runs.`:'No clearly labeled runs were detected.',next:`Include a labeled results row for every required run and attach the exported evidence CSV.`},
  {group:'Experimental design & completion',label:'Intentional variable changes',pass:comparison>=2&&/\b(setting|parameter|variable|baseline|held constant|same configuration)\b/i.test(raw),found:'Comparison and experimental-design language was detected.',next:'Name the baseline and state exactly which single variable changed in each comparison.'},
  {group:'Evidence & results',label:'Results table or evidence CSV',pass:payload.csvRows>1||(/\brun\b/i.test(raw)&&countMatches(lower,/\b(accuracy|loss|score|inertia|prediction|output|result|metric)\b/gi)>=3),found:payload.csvRows? `Evidence CSV contains ${payload.csvRows} data rows.`:'Result language was found in the report.',next:'Add a compact table with run ID, settings changed, and numeric/observable output.'},
  {group:'Evidence & results',label:'At least two supporting visuals',pass:screenshotSignals>=2,found:`Detected ${screenshotSignals} image, screenshot, figure, or appendix signals.`,next:'Attach at least two screenshots and refer to each one in the analysis.'},
  {group:'Technical explanation',label:'Uses lab-specific concepts',pass:concepts.length>=3,found:concepts.length?`Found: ${concepts.join(', ')}.`:'Few lab-specific concepts were detected.',next:`Connect the evidence to at least three relevant ideas, such as ${cfg.concepts.slice(0,5).join(', ')}.`},
  {group:'Technical explanation',label:'Explains why behavior changed',pass:reasoning>=2,found:`Detected ${reasoning} cause-and-explanation signals.`,next:'Go beyond describing numbers: explain why the changed setting produced the observed behavior.'},
  {group:'Interpretation & comparison',label:'Compares specific runs',pass:comparison>=4&&runEvidence>=2,found:`Detected ${comparison} comparison signals.`,next:'Compare two named run IDs and cite their exact settings and outputs.'},
  {group:'Critical reflection',label:'Limitation, uncertainty, ethics, or failure mode',pass:/\b(limit|limitation|uncertain|uncertainty|ethic|bias|fair|failure|cannot establish|does not prove|risk|appropriate use)\b/i.test(raw),found:'Critical-reflection language was detected.',next:'Add a limitation or failure mode and one follow-up experiment that could test your interpretation.'},
  {group:'Communication & authorship',label:'Session code on the report',pass:/\bGB-[A-Z0-9]{4}-\d{4}\b/i.test(raw),found:'A valid AI Lab session-code pattern was detected.',next:'Put your AI Lab session code on the first page.'},
  {group:'Communication & authorship',label:'Personalized checkpoint response',pass:/\b(personalized\s+checkpoint|checkpoint\s+response|my checkpoint)\b/i.test(raw),found:'A checkpoint section was detected.',next:'Add a labeled Personalized Checkpoint section and answer the exact prompt from your Assignment tab.'},
  {group:'Communication & authorship',label:'Authorship statement',pass:/\b(i certify|authorship statement|work and written explanations.*my own|my own work)\b/i.test(raw),found:'An authorship statement was detected.',next:'Add the required authorship statement from the Assignment tab.'}
 ];
}
function renderResults(checks,payload,lab,attemptNumber){
 const passed=checks.filter(x=>x.pass).length,pct=Math.round(passed/checks.length*100),groups=[...new Set(checks.map(x=>x.group))];results.hidden=false;
 results.innerHTML=`<div class="grader-result-head"><div><div class="kicker">Readiness check ${attemptNumber} of 2 · ${esc(LABS[lab].name)}</div><h2>${passed} of ${checks.length} evidence signals found</h2><p>This percentage measures visible readiness signals—not assignment quality and not a grade.</p></div><div class="readiness-ring" style="--ready:${pct*3.6}deg"><strong>${pct}%</strong><span>ready</span></div></div>
 ${payload.warnings.length?`<div class="grader-warning"><strong>File-reading note</strong><p>${payload.warnings.map(esc).join(' ')}</p></div>`:''}
 <div class="grader-groups">${groups.map(group=>`<section><h3>${esc(group)}</h3>${checks.filter(x=>x.group===group).map(x=>`<article class="${x.pass?'complete':'needs-work'}"><span>${x.pass?'✓':'!'}</span><div><strong>${esc(x.label)}</strong><p>${esc(x.pass?x.found:x.next)}</p></div></article>`).join('')}</section>`).join('')}</div>
 <div class="grader-next"><strong>Before D2L</strong><ol><li>Fix every item marked with an exclamation point.</li><li>Re-open this lab’s Assignment and Rubric tabs for the official requirements.</li><li>Verify that screenshots and CSV evidence match the claims in your report.</li></ol></div>`;
 results.scrollIntoView({behavior:'smooth',block:'start'});
}
form.addEventListener('submit',async event=>{
 event.preventDefault();const info=await attemptInfo();if(!info.allowed){alert(info.total>=2?'You have used both readiness checks for this assignment.':'Only one readiness check is allowed per day for this assignment.');return;}
 const button=form.querySelector('[type=submit]');button.disabled=true;button.textContent='Reading files…';
 try{const payload=await readFiles();if(!payload.text.trim()&&!payload.csvRows&&!payload.images)throw new Error('Add a report, evidence file, image, or pasted draft first.');const lab=$('#graderLab').value,checks=evaluate(payload,lab),dates=info.dates||[];dates.push(today());localStorage.setItem(info.key,JSON.stringify(dates));renderResults(checks,payload,lab,dates.length);await updateAttemptStatus();}
 catch(error){alert(error.message||'The files could not be checked.');}
 finally{button.disabled=false;button.textContent='Check my submission';}
});
fileInput.addEventListener('change',fileSummary);$('#graderStudent').addEventListener('change',updateAttemptStatus);$('#graderLab').addEventListener('change',updateAttemptStatus);
const dialog=$('#quickStartDialog'),video=$('#quickStartVideo');function openVideo(){dialog.showModal();video.currentTime=0;video.play().catch(()=>{});}$('#playQuickStart').addEventListener('click',openVideo);$('#playQuickStartPoster').addEventListener('click',openVideo);$('#closeQuickStart').addEventListener('click',()=>{video.pause();dialog.close();});dialog.addEventListener('click',e=>{if(e.target===dialog){video.pause();dialog.close();}});
updateAttemptStatus();
