// Divine Care — Static Site JS

// Header scroll
const header = document.querySelector('.site-header');
const isLight = header?.classList.contains('light');
function onScroll(){
  if(!header) return;
  if(isLight) return;
  header.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');
toggle?.addEventListener('click', ()=> links?.classList.toggle('open'));

// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }});
},{threshold:0.12, rootMargin:'0px 0px -60px 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Hero parallax
const heroBg = document.querySelector('.hero-bg img');
if(heroBg){
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    heroBg.style.setProperty('--parallax', `${y*0.25}px`);
  }, {passive:true});
}

// Stat counters
const stats = document.querySelectorAll('.stat .num[data-target]');
const statIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix||'';
    const dur = 1800; const start = performance.now();
    function tick(t){
      const p = Math.min(1,(t-start)/dur);
      const eased = 1-Math.pow(1-p,3);
      const val = target*eased;
      el.textContent = (target%1?val.toFixed(1):Math.round(val).toLocaleString()) + suffix;
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    statIO.unobserve(el);
  });
},{threshold:0.4});
stats.forEach(s=>statIO.observe(s));

// Accordion
document.querySelectorAll('.acc-item .acc-q').forEach(q=>{
  q.addEventListener('click', ()=> q.parentElement.classList.toggle('open'));
});

// Horizontal parallax gallery
const hScroll = document.querySelector('.h-scroll');
if(hScroll){
  const track = hScroll.querySelector('.h-track');
  const bar = hScroll.querySelector('.h-progress .bar');
  const slides = hScroll.querySelectorAll('.h-slide img');
  function updateH(){
    const rect = hScroll.getBoundingClientRect();
    const total = hScroll.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const p = total>0 ? scrolled/total : 0;
    const maxX = track.scrollWidth - window.innerWidth;
    track.style.transform = `translate3d(${-p*maxX}px,0,0)`;
    if(bar) bar.style.width = `${p*100}%`;
    // subtle image parallax within each slide
    slides.forEach((img, i)=>{
      const slideRect = img.getBoundingClientRect();
      const centerDist = (slideRect.left + slideRect.width/2) - window.innerWidth/2;
      const norm = centerDist / window.innerWidth;
      img.style.transform = `translate3d(${-norm*40}px,0,0) scale(1.15)`;
    });
  }
  window.addEventListener('scroll', updateH, {passive:true});
  window.addEventListener('resize', updateH);
  updateH();
}

// Stacked cards effect (scale down as next covers)
const stackCards = document.querySelectorAll('.stack-card');
if(stackCards.length){
  function updateStack(){
    stackCards.forEach((card, i)=>{
      const rect = card.getBoundingClientRect();
      const topOffset = parseInt(getComputedStyle(card).top) || 100;
      const progress = Math.max(0, Math.min(1, (topOffset - rect.top) / (window.innerHeight*0.8)));
      const scale = 1 - progress*0.08;
      const opacity = 1 - progress*0.3;
      card.style.transform = `scale(${scale})`;
      card.style.opacity = opacity;
    });
  }
  window.addEventListener('scroll', updateStack, {passive:true});
  updateStack();
}

// Set active nav link
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a=>{
  const href = a.getAttribute('href');
  if(href === path) a.style.color = 'var(--gold)';
});
