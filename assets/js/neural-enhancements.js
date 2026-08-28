(function(){
'use strict';
if(!location.pathname.endsWith('neural-network-tutorial.html')) return;
document.body.classList.add('nn-enhanced');
const $=id=>document.getElementById(id), qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
const topics=[
 {title:'Inputs',why:'Data becomes numbers the network can process.',do:'Move one customer slider while holding the other two fixed.',look:'Watch the input node and purchase probability. The weights do not change.',worked:'If Ad Engagement changes from 0.40 to 0.80, every connection leaving that input receives twice the input signal before its weight is applied.'},
 {title:'Weights',why:'Weights encode the current strength and direction of each connection.',do:'Inspect the labeled connections. Compare a positive and a negative weight.',look:'Positive and negative weights can push a hidden neuron in opposite directions.',worked:'For a weight of +0.70 and input 0.80: 0.80 × 0.70 = 0.56. For −0.60 and input 0.30: 0.30 × −0.60 = −0.18.'},
 {title:'Bias',why:'Bias gives a neuron a learnable shift that is independent of the current inputs.',do:'Read the hidden and output bias values, then follow the weighted-sum calculation.',look:'The bias is added after weighted inputs and before activation.',worked:'z = Σ(wx) + b. If weighted inputs total 0.90 and b = −0.20, the raw neuron value becomes 0.70.'},
 {title:'Hidden layer',why:'Hidden neurons create intermediate representations from the same input features.',do:'Compare h₁ and h₂ while changing Price Sensitivity.',look:'The two hidden neurons respond differently because they have different weights and biases.',worked:'Two neurons can receive identical inputs but produce different activations because each learns its own parameter set.'},
 {title:'Activation',why:'A nonlinear activation transforms the raw weighted sum and allows layered networks to model more than a single linear rule.',do:'Use the displayed sigmoid calculation and compare a negative versus positive z value.',look:'Sigmoid maps any real number between 0 and 1.',worked:'σ(z)=1/(1+e⁻ᶻ). At z=0, σ(z)=0.50. Positive z produces values above 0.50; negative z produces values below 0.50.'},
 {title:'Output',why:'The final neuron converts hidden-layer signals into a probability estimate.',do:'Change the decision threshold from 0.50 to 0.30 and then 0.80.',look:'The probability stays the same while the business decision may change.',worked:'A 0.68 probability predicts BUY at a 0.50 threshold but NO BUY at a 0.80 threshold.'},
 {title:'Loss',why:'Training needs a numerical signal that says how incompatible the prediction is with the known outcome.',do:'Toggle the actual outcome between Purchased and Did Not Buy.',look:'Loss changes immediately even though the prediction stays fixed.',worked:'Binary cross-entropy heavily penalizes confident wrong predictions. A prediction near the correct class gives lower loss.'},
 {title:'Learning rate',why:'The learning rate determines how large each update step is.',do:'Try η=.001, train 20 epochs, then reset and try η=1.0.',look:'Compare how quickly and smoothly loss changes.',worked:'Update rule: parameter ← parameter − η × gradient. Same gradient + larger η = larger movement.'},
 {title:'Backpropagation',why:'Backpropagation efficiently computes how each parameter contributed to the loss.',do:'Click Train 1 step, then compare weights and loss before and after.',look:'Parameters move in a direction intended to reduce future loss for that training example.',worked:'Backpropagation calculates gradients; the learning rate scales those gradients; the optimizer applies the update.'},
 {title:'Training → inference',why:'Training learns parameters. Inference uses those learned parameters on new data.',do:'Switch to inference mode, change customer inputs, and observe the prediction.',look:'The prediction changes because inputs changed, but training controls are disabled and parameters stay fixed.',worked:'A deployed model may make thousands of inference predictions before a later retraining cycle updates its parameters.'}
];
const lessonButtons=()=>qsa('#stageNav button');
function currentLesson(){return Math.max(0,lessonButtons().findIndex(b=>b.classList.contains('active')))}
function addLearningPath(){
 const workspace=qs('.nn-workspace .container'); if(!workspace||qs('.nn-learning-path'))return;
 const bar=document.createElement('div');bar.className='nn-learning-path';bar.innerHTML=`<div class="nn-learning-path-inner">
 <button class="nn-path-tab active" data-path="concept"><span>1 · Understand</span><b>Concept walkthrough</b></button>
 <button class="nn-path-tab" data-path="calculate"><span>2 · Calculate</span><b>Follow the math</b></button>
 <button class="nn-path-tab" data-path="train"><span>3 · Train</span><b>Watch learning</b></button>
 <button class="nn-path-tab" data-path="experiment"><span>4 · Experiment</span><b>Break it safely</b></button>
 <button class="nn-path-tab" data-path="check"><span>5 · Check</span><b>Quiz + evidence</b></button></div>`;
 workspace.insertBefore(bar,workspace.firstChild);
 qsa('.nn-path-tab',bar).forEach(b=>b.onclick=()=>navigate(b.dataset.path));
}
function navigate(path){
 const map={concept:'.nn-stage-nav',calculate:'.nn-board',train:'.nn-history',experiment:'.nn-challenges',check:'#knowledge-check'};
 qsa('.nn-path-tab').forEach(b=>b.classList.toggle('active',b.dataset.path===path));
 const el=qs(map[path]);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
 if(path==='train'){setTimeout(()=>highlightTraining('Use Train 1 step first. Predict whether loss will rise or fall before clicking.'),500)}
}
function addGuidedAction(){
 const board=qs('.nn-board');if(!board||qs('.nn-guided-action'))return;
 const action=document.createElement('div');action.className='nn-guided-action';action.innerHTML='<div class="step-badge" id="guideBadge">1</div><div><h3 id="guideTitle">Do this now</h3><p id="guideText">Move one customer input slider and watch the corresponding node.</p></div><button class="nn-btn primary" id="guideAction">Try it</button>';
 const head=qs('.nn-board-head',board);head.insertAdjacentElement('afterend',action);$('guideAction').onclick=performGuided;
 const panel=document.createElement('div');panel.className='nn-topic-panel';panel.innerHTML='<article class="nn-topic-card"><h3 id="topicWhy">Why this matters</h3><p id="topicWhyText"></p><ul><li><strong>Do:</strong> <span id="topicDo"></span></li><li><strong>Look for:</strong> <span id="topicLook"></span></li></ul></article><article class="nn-worked-card"><h3>Worked example</h3><code id="topicWorked"></code><div class="answer"><strong>Key idea:</strong> <span id="topicAnswer"></span></div></article>';
 qs('.nn-explain',board).insertAdjacentElement('afterend',panel);refreshTopic();
 const obs=new MutationObserver(refreshTopic);lessonButtons().forEach(b=>obs.observe(b,{attributes:true,attributeFilter:['class']}));
}
function refreshTopic(){
 const i=currentLesson(),t=topics[i]||topics[0];$('guideBadge').textContent=i+1;$('topicWhyText').textContent=t.why;$('topicDo').textContent=t.do;$('topicLook').textContent=t.look;$('topicWorked').textContent=t.worked;$('topicAnswer').textContent=answerFor(i);
 const guide=guideFor(i);$('guideText').textContent=guide.text;$('guideAction').textContent=guide.button;clearHighlights();
 if([0,5,6,7,8,9].includes(i))highlightRelevant(i,false);
}
function answerFor(i){return[
 'Inputs change the signal entering the model; they do not automatically change learned parameters.',
 'Training changes weights; their signs and magnitudes determine how signals currently influence the next neuron.',
 'Bias is a learnable offset added before activation.',
 'Hidden neurons learn different combinations of the same features.',
 'Activation transforms z and introduces nonlinearity.',
 'Probability is a model output; threshold is a business or classification rule.',
 'Loss evaluates a prediction against the known training target.',
 'Learning rate scales how far parameters move during an update.',
 'Backpropagation computes gradients; it does not itself choose the learning rate.',
 'Inference uses learned parameters without updating them for that prediction.'
 ][i]||''}
function guideFor(i){return[
 {button:'Change Ad Engagement',text:'Move Ad Engagement to 0.40, predict the direction of the output change, then move it to 0.90.'},
 {button:'Animate weights',text:'Run the forward animation. Follow the signal along the labeled weighted connections.'},
 {button:'Show calculation',text:'Focus on Σ(wx)+b in the worked calculation. Identify exactly where bias enters.'},
 {button:'Compare hidden neurons',text:'Change Price Sensitivity and compare h₁ with h₂. They should not react identically.'},
 {button:'Test z = 0 idea',text:'Remember: sigmoid(0)=0.50. Compare that anchor with the current hidden activations.'},
 {button:'Test threshold',text:'Set the threshold to 0.80, then to 0.30. Watch the decision while keeping the probability fixed.'},
 {button:'Flip actual outcome',text:'Switch the actual outcome and observe how loss changes without retraining.'},
 {button:'Compare η values',text:'Use η=.001 and η=1.0 on separate reset runs. Record both loss curves.'},
 {button:'Train one step',text:'Record the current loss, train exactly one step, then compare the new loss and parameters.'},
 {button:'Switch mode',text:'Enter inference mode. Change inputs and verify that predictions change while training is disabled.'}
 ][i]||{button:'Try it',text:'Change one variable and observe the result.'}}
function performGuided(){
 const i=currentLesson();highlightRelevant(i,true);
 if(i===0){$('adInput').value=.40;$('adInput').dispatchEvent(new Event('input',{bubbles:true}))}
 else if(i===1){$('forwardBtn').click()}
 else if(i===2||i===4){qs('.nn-formula')?.scrollIntoView({behavior:'smooth',block:'center'})}
 else if(i===3){$('priceInput').value=.85;$('priceInput').dispatchEvent(new Event('input',{bubbles:true}))}
 else if(i===5){$('thresholdInput').value=.80;$('thresholdInput').dispatchEvent(new Event('input',{bubbles:true}))}
 else if(i===6){$('actualNo').click()}
 else if(i===7){$('slowLR').click();highlightTraining('Now train 20 epochs, note the loss change, reset, then repeat with η=1.0.')}
 else if(i===8){$('trainOne').click();highlightTraining('Compare the loss and displayed weight values with what you saw immediately before the click.')}
 else if(i===9){$('toggleMode').click()}
}
function clearHighlights(){qsa('.highlight-control').forEach(e=>e.classList.remove('highlight-control'));qsa('.nn-control-hint').forEach(e=>e.remove())}
function highlightRelevant(i,withHint){
 let target=null,msg='';
 if(i===0){target=qs('.nn-controls');msg='Change one input at a time so cause and effect stay visible.'}
 if(i===5){target=$('thresholdInput')?.closest('label');msg='Threshold changes the classification decision, not the model probability.'}
 if(i===6){target=qs('.nn-actual')?.parentElement;msg='The actual label is available during supervised training and is needed to calculate loss.'}
 if(i===7){target=$('lrInput')?.closest('label');msg='Learning rate only matters when an update is performed.'}
 if(i===8){target=$('trainOne')?.parentElement;msg='Use one training step before many epochs so you can see a single update clearly.'}
 if(i===9){target=$('toggleMode')?.parentElement;msg='Inference freezes learning while still allowing new predictions.'}
 if(target){target.classList.add('highlight-control');if(withHint){const h=document.createElement('div');h.className='nn-control-hint';h.textContent=msg;target.appendChild(h)}}
}
function highlightTraining(msg){const p=$('trainOne')?.parentElement;if(!p)return;clearHighlights();p.classList.add('highlight-control');const h=document.createElement('div');h.className='nn-control-hint';h.textContent=msg;p.appendChild(h)}
function addKnowledgeStrip(){const intro=qs('.nn-intro');if(!intro||qs('.nn-knowledge-strip'))return;const c=document.createElement('div');c.className='container';c.innerHTML='<div class="nn-knowledge-strip"><article><b>Forward pass</b>Inputs → weighted sums → activations → prediction</article><article><b>Loss</b>Prediction compared with the known answer</article><article><b>Backward pass</b>Gradients identify useful parameter changes</article><article><b>Update</b>Learning rate scales the change to weights and biases</article></div>';intro.insertAdjacentElement('afterend',c)}
const questions=[
 {q:'What is the primary role of a weight in this network?',a:['Store the customer record','Control the influence of a connection','Set the number of epochs','Choose the actual label'],correct:1,why:'A weight multiplies a signal and controls that connection’s current influence.'},
 {q:'Where is bias added?',a:['After the final business decision','Before a neuron’s activation function','Only after training finishes','Directly to the learning rate'],correct:1,why:'A neuron first forms z = Σ(wx) + b, then applies its activation.'},
 {q:'Why does this tutorial use sigmoid?',a:['It guarantees perfect accuracy','It maps a raw value into a 0–1 range that is easy to interpret','It removes the need for weights','It automatically chooses the threshold'],correct:1,why:'Sigmoid is pedagogically useful here because its output is bounded between 0 and 1.'},
 {q:'The model outputs 0.68. What happens if the threshold moves from 0.50 to 0.80?',a:['The probability automatically falls','The model retrains','The classification can change from BUY to NO BUY while probability stays 0.68','The loss becomes zero'],correct:2,why:'Thresholding is separate from the probability calculation.'},
 {q:'What does binary cross-entropy loss do in this supervised example?',a:['Measures disagreement between prediction and known outcome','Sets customer input values','Counts hidden neurons','Chooses the marketing campaign'],correct:0,why:'Loss provides the numerical training objective by comparing prediction and target.'},
 {q:'What does a very small learning rate usually imply?',a:['No forward pass occurs','Parameter updates are small and learning may be slow','The model skips loss calculation','All weights become negative'],correct:1,why:'Learning rate scales update size; a very small value generally produces small steps.'},
 {q:'What is backpropagation responsible for?',a:['Creating the business threshold','Computing gradients that show how parameters affect loss','Collecting new customers','Normalizing the browser window'],correct:1,why:'Backpropagation efficiently applies the chain rule to compute gradients.'},
 {q:'What does one epoch mean in this lab?',a:['One hidden neuron fires','The network processes the full training dataset once','One weight becomes positive','The threshold is changed once'],correct:1,why:'An epoch is one complete pass through all training examples.'},
 {q:'Which statement correctly distinguishes training from inference?',a:['Both always update weights','Inference updates weights but training does not','Training can update parameters; inference uses learned parameters for prediction','Inference requires the actual label for every prediction'],correct:2,why:'Training learns parameters; inference applies them to new inputs.'},
 {q:'Why should a business manager care about the decision threshold?',a:['It can change which customers receive an action even when model probabilities are unchanged','It determines the number of hidden layers','It replaces the loss function','It makes input data unnecessary'],correct:0,why:'Threshold choice connects model scores to operational actions, costs, and tradeoffs.'}
];
const quizKey='badm201_nn_quiz_v1';
function addQuiz(){
 if(qs('#knowledge-check'))return;const anchor=qs('#evidence-panel')||qs('.nn-questions');if(!anchor)return;
 const sec=document.createElement('section');sec.id='knowledge-check';sec.className='nn-quiz-section';sec.innerHTML=`<div class="container"><div class="section-head"><div><div class="kicker">Knowledge check</div><h2>10 questions · immediate feedback</h2></div><p>Answer all questions before checking. After the first attempt, explanations appear so the quiz becomes another learning step.</p></div><div class="nn-quiz-shell"><div class="nn-quiz-card"><form id="nnQuizForm">${questions.map((x,i)=>`<div class="nn-q" data-q="${i}"><h3>${i+1}. ${x.q}</h3>${x.a.map((a,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${a}</label>`).join('')}<div class="nn-feedback" id="fb${i}"></div></div>`).join('')}</form></div><aside class="nn-quiz-side"><div class="kicker">Attempt status</div><div class="nn-quiz-score" id="quizScore">—</div><p id="quizMessage">Complete all 10 questions, then check your answers.</p><div class="nn-quiz-actions"><button class="nn-btn primary" id="checkQuiz">Check answers</button><button class="nn-btn" id="resetQuiz">New attempt</button></div><p class="nn-answer-note" id="attemptNote"></p></aside></div></div>`;
 anchor.insertAdjacentElement('beforebegin',sec);$('checkQuiz').onclick=checkQuiz;$('resetQuiz').onclick=resetQuiz;renderAttempts();
}
function attempts(){try{return JSON.parse(localStorage.getItem(quizKey))||[]}catch(e){return[]}}
function renderAttempts(){const a=attempts();if($('attemptNote'))$('attemptNote').textContent=a.length?`Previous attempts in this browser: ${a.length}. Best score: ${Math.max(...a.map(x=>x.score))}/10.`:'No previous attempt saved in this browser.'}
function checkQuiz(e){e.preventDefault();let score=0,answered=0;questions.forEach((x,i)=>{const picked=qs(`input[name=q${i}]:checked`);const box=qs(`[data-q="${i}"]`);qsa('label',box).forEach(l=>l.classList.remove('correct','wrong'));if(!picked)return;answered++;const val=+picked.value;if(val===x.correct)score++;qsa('label',box).forEach((l,j)=>{if(j===x.correct)l.classList.add('correct');else if(j===val)l.classList.add('wrong')});const fb=$('fb'+i);fb.classList.add('show');fb.innerHTML=`<strong>${val===x.correct?'Correct.':'Review this one.'}</strong> ${x.why}`});if(answered<questions.length){$('quizMessage').textContent=`You answered ${answered}/10. Complete every question before scoring.`;return}const list=attempts();list.push({time:new Date().toISOString(),score});localStorage.setItem(quizKey,JSON.stringify(list));$('quizScore').textContent=score+'/10';$('quizMessage').textContent=score>=8?'Strong understanding. Review any missed explanations, then continue to your evidence summary.':score>=6?'Good start. Review the explanations and retry the concepts you missed.':'Return to the guided steps, especially loss, learning rate, backpropagation, and training vs. inference.';renderAttempts();if(window.localStorage){try{const ev=JSON.parse(localStorage.getItem('badm201_nn_evidence_v1')||'{}');ev.checks=ev.checks||{};ev.checks.quiz=true;ev.quizBest=Math.max(ev.quizBest||0,score);localStorage.setItem('badm201_nn_evidence_v1',JSON.stringify(ev))}catch(err){}}}
function resetQuiz(e){e.preventDefault();$('nnQuizForm').reset();qsa('.nn-q label').forEach(l=>l.classList.remove('correct','wrong'));qsa('.nn-feedback').forEach(f=>f.classList.remove('show'));$('quizScore').textContent='—';$('quizMessage').textContent='New attempt ready. Explanations will appear after you check all answers.'}
function init(){addLearningPath();addKnowledgeStrip();addGuidedAction();addQuiz();setTimeout(refreshTopic,200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();