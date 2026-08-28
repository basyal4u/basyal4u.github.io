(function(){
 const base=location.pathname.includes('/admin/')?'../':'';
 const nav=`<header class="site-header"><div class="container nav-wrap"><a class="brand" href="${base}index.html">Ganga Prasad <span>Basyal, PhD</span></a><button class="nav-toggle" aria-label="Menu" aria-expanded="false">☰</button><nav class="nav-links"><a href="${base}about.html">About</a><a href="${base}research.html">Research</a><a href="${base}publications.html">Publications</a><a href="${base}teaching.html">Teaching</a><a href="${base}students.html">Students</a><a href="${base}professional.html">Professional</a><a href="${base}news.html">News</a><a href="${base}contact.html">Contact</a></nav></div></header>`;
 const foot=`<footer class="site-footer"><div class="container footer-grid"><div><strong>Ganga Prasad Basyal, PhD</strong><div>Assistant Professor of Information Systems · Dakota State University</div></div><div class="small">© ${new Date().getFullYear()} Ganga Prasad Basyal</div></div></footer>`;
 document.querySelectorAll('[data-site-nav]').forEach(x=>x.innerHTML=nav);document.querySelectorAll('[data-site-footer]').forEach(x=>x.innerHTML=foot);
 const t=document.querySelector('.nav-toggle'),n=document.querySelector('.nav-links'); if(t&&n)t.onclick=()=>{const open=n.classList.toggle('open');t.setAttribute('aria-expanded',String(open));};
 if(!location.pathname.includes('/admin/')){
   const tutorialHref='neural-network-tutorial.html';
   const teachingCard=document.querySelector('.ai-teaching-lab');
   if(teachingCard && !teachingCard.querySelector('[data-nn-tutorial-link]')){
     const primary=teachingCard.querySelector('a.btn.primary');
     if(primary){const link=document.createElement('a');link.className='btn';link.href=tutorialHref;link.setAttribute('data-nn-tutorial-link','');link.textContent='Chapter 1 · Neural Network Tutorial →';primary.insertAdjacentElement('afterend',link);}
   }
   if(document.body && location.pathname.endsWith('ai-lab.html')){
     document.body.classList.add('ai-lab-coherent');
     if(!document.querySelector('link[data-ai-lab-coherence]')){const css=document.createElement('link');css.rel='stylesheet';css.href='assets/css/ai-lab-coherence.css?v=20260828d';css.setAttribute('data-ai-lab-coherence','');document.head.appendChild(css);}
     if(!document.querySelector('[data-nn-tutorial-banner]')){
       const hero=document.querySelector('.page-hero');if(hero){const section=document.createElement('section');section.setAttribute('data-nn-tutorial-banner','');section.innerHTML=`<div class="container"><div class="card" style="margin:24px 0;padding:22px;display:flex;gap:22px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div><div class="kicker">BADM-201 · Chapter 1 foundation lab</div><h2 style="margin:.25rem 0">Inside a Neural Network: Will the Customer Buy?</h2><p style="margin:0;max-width:780px">Start with the guided no-code neural-network assignment, then continue into the six AI Lab modules using the same Learn → Experiment → Assignment → Rubric → Example flow.</p></div><a class="btn primary" href="${tutorialHref}">Start guided tutorial →</a></div></div>`;hero.insertAdjacentElement('afterend',section);}
     }
   }
   if(document.body && location.pathname.endsWith('neural-network-tutorial.html')){
     const addStyle=(href,attr)=>{if(!document.querySelector(`link[${attr}]`)){const css=document.createElement('link');css.rel='stylesheet';css.href=href;css.setAttribute(attr,'');document.head.appendChild(css);}};
     const addScript=(src,attr)=>{if(!document.querySelector(`script[${attr}]`)){const s=document.createElement('script');s.src=src;s.defer=true;s.setAttribute(attr,'');document.body.appendChild(s);}};
     addStyle('assets/css/neural-enhancements.css?v=20260828d','data-nn-enhancements');
     addStyle('assets/css/neural-coherence-v3.css?v=20260828d','data-nn-coherence');
     addScript('assets/js/neural-enhancements.js?v=20260828d','data-nn-enhancements');
     addScript('assets/js/neural-assignment.js?v=20260828d','data-nn-assignment');
     addScript('assets/js/neural-evidence.js?v=20260828d','data-nn-evidence');
   }
 }
})();
