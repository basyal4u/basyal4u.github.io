function openLab(id){document.querySelectorAll('.lab-panel,.experiment').forEach(x=>x.classList.remove('active'));const el=document.getElementById('lab-'+id);if(el){el.classList.add('active');el.scrollIntoView({behavior:'smooth',block:'start'});}}
window.openLab=openLab;
