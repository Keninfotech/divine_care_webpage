// Divine Care — Static Site JS
// -----------------------------------------------------------------------------
// Header + footer are injected here so we only maintain them in one place.
// Every HTML page just needs <div id="site-header"></div> and <div id="site-footer"></div>.
//
// Performance note: all scroll-position-driven effects (header state, hero
// parallax, horizontal gallery, sticky-card scaling, admissions progress bar)
// are batched into a single requestAnimationFrame tick per scroll event
// instead of each having its own listener. On low-end devices we also skip
// the purely decorative transforms entirely.
// -----------------------------------------------------------------------------

const NAV_LINKS = [
  ['index.html', 'Home'],
  ['deanston.html', 'Deanston Enhanced Care'],
  ['centenary.html', 'Centenary House'],
  ['care.html', 'Care Services'],
  ['about.html', 'About Us'],
  ['contact.html', 'Contact & FAQs'],
];

// Low-end / constrained-device detection, used to skip decorative
// scroll-linked transforms (parallax, sticky-card scaling, drag galleries).
// Only skip decorative effects on truly low-end devices (≤2GB RAM or ≤2 cores).
// The previous threshold of ≤4 was too broad and disabled animations on most
// budget / older laptops, which typically report 4 cores and 4 GB.
const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOW_MEMORY = 'deviceMemory' in navigator && navigator.deviceMemory <= 2;
const LOW_CPU = 'hardwareConcurrency' in navigator && navigator.hardwareConcurrency <= 2;
const SAVE_DATA = !!(navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || '')));
const REDUCE_FX = REDUCED_MOTION || LOW_MEMORY || LOW_CPU || SAVE_DATA;

function renderHeader() {
  const host = document.getElementById('site-header');
  if (!host) return;
  const variant = host.dataset.variant || 'dark'; // 'dark' = transparent-over-hero, 'light' = solid white
  const cls = variant === 'light' ? 'site-header light' : 'site-header';
  host.outerHTML = `
<header class="${cls}">
  <div class="site-progress-bar"><div class="bar"></div></div>
  <div class="container nav">
    <a href="index.html" class="brand">
      <img src="logo.png" alt="Divine Care Homes Scotland Ltd." decoding="async" />
      <span class="brand-text">Divine Care Homes<small>Scotland Ltd.</small></span>
    </a>
    <ul class="nav-links">
      ${NAV_LINKS.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}
    </ul>
    <button class="menu-toggle" aria-label="Menu">☰</button>
  </div>
</header>`;
}

function renderFooter() {
  const host = document.getElementById('site-footer');
  if (!host) return;
  host.outerHTML = `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <a href="index.html" class="brand footer-brand">
          <span class="logo-badge"><img src="logo.png" alt="Divine Care Homes Scotland Ltd." loading="lazy" decoding="async" /></span>
          <span class="brand-text">Divine Care Homes<small>Scotland Ltd.</small></span>
        </a>
        <p style="max-width:320px;margin-top:12px;color:rgba(255,255,255,0.75)">Delivering excellence in care with a DIVINE touch. Person-centred residential, nursing, dementia, and respite care across Scotland.</p>
      </div>
      <div>
        <h4>Our Homes</h4>
        <ul>
          <li><a href="deanston.html">Deanston Enhanced Care</a></li>
          <li><a href="centenary.html">Centenary House Care Home</a></li>
          <li><a href="homes.html">Overview of Homes</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="about.html">About Us</a></li>
          <li><a href="care.html">Care Services</a></li>
          <li><a href="index.html#quality">Quality & Safety</a></li>
          <li><a href="contact.html">Contact Us & FAQs</a></li>
        </ul>
      </div>
      <div>
        <h4>Locations & Enquiries</h4>
        <ul>
          <li><strong>Deanston:</strong> 36 Lefroy St, Coatbridge ML5 1LZ</li>
          <li><strong>Centenary:</strong> Whifflet, Coatbridge</li>
          <li><a href="mailto:enquiries@divinecarehomes.co.uk">enquiries@divinecarehomes.co.uk</a></li>
          <li>01236 000000</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Divine Care Homes Scotland Ltd. Services are provided according to each home’s registration, availability and individual assessment.</span>
      <span>Dignity · Individuality · Value · Integrity · Nurturing · Excellence</span>
    </div>
  </div>
</footer>`;
}

// -----------------------------------------------------------------------------
// Everything below runs AFTER the header/footer are in the DOM
// -----------------------------------------------------------------------------
function initInteractions() {
  const header = document.querySelector('.site-header');
  const isLight = header?.classList.contains('light');

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  toggle?.addEventListener('click', () => links?.classList.toggle('open'));
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => links?.classList.remove('open'));
  });

  // Active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.style.color = 'var(--gold-2)';
  });

  // Auto-stagger grid elements for fluid cascading scroll reveal
  const staggerContainers = document.querySelectorAll(
    '.home-showcase-grid, .divine-values-grid, .why-grid, .qa-grid, .facility-grid, .gallery-grid, .settling-grid, .card-grid'
  );
  staggerContainers.forEach(container => {
    const children = Array.from(container.children);
    children.forEach((child, idx) => {
      if (!child.classList.contains('reveal') && !child.classList.contains('reveal-scale')) {
        child.classList.add('reveal');
      }
      child.style.transitionDelay = `${(idx % 4) * 0.12}s`;
    });
  });

  // Reveal on scroll — IntersectionObserver
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-up').forEach(el => io.observe(el));

  // Stat counters (skip the count-up animation on low-end/reduced-motion, jump to the final value)
  const stats = document.querySelectorAll('.stat .num[data-target]');
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      statIO.unobserve(el);
      if (REDUCE_FX) {
        el.textContent = (target % 1 ? target.toFixed(1) : Math.round(target).toLocaleString()) + suffix;
        return;
      }
      const dur = 1800; const start = performance.now();
      function tick(t) {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = (target % 1 ? val.toFixed(1) : Math.round(val).toLocaleString()) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  stats.forEach(s => statIO.observe(s));

  // Accordion
  document.querySelectorAll('.acc-item .acc-q').forEach(q => {
    q.addEventListener('click', () => q.parentElement.classList.toggle('open'));
  });

  // Care Services Tab Switcher
  const tabBtns = document.querySelectorAll('.care-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPaneId = btn.dataset.tab;
      const parent = btn.closest('.care-tabs-container') || document;
      parent.querySelectorAll('.care-tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.care-tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPane = parent.querySelector(`.care-tab-pane[data-pane="${targetPaneId}"]`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Form submission feedback
  document.querySelectorAll('form.enquiry').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn ? btn.textContent : '';
      if (btn) {
        btn.textContent = 'Enquiry Sent! Thank you.';
        btn.style.background = 'var(--gold)';
        btn.disabled = true;
      }
      setTimeout(() => {
        form.reset();
        if (btn) {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }
      }, 4000);
    });
  });

  // Experience page — enable scroll-snap on root (skipped for reduced motion)
  if (document.body.dataset.page === 'experience' && !REDUCED_MOTION) {
    document.documentElement.classList.add('snap-page');
  }

  // Sticky full-page slides — JS-driven navigation (wheel + touch)
  // This avoids the browser sending scroll events into the container
  // depending on cursor position.
  const fpSlides = document.querySelector('.fp-slides');
  const fpTrack  = document.querySelector('.fp-slides-track');
  if (fpSlides && fpTrack) {
    const slides = fpTrack.querySelectorAll('.fp-slide');
    const total  = slides.length;
    let current  = 0;
    let busy     = false;
    let active   = false; // true when .fp-slides is fully in view

    function goTo(idx) {
      if (idx < 0 || idx >= total) return false;
      current = idx;
      fpTrack.style.transform = `translateY(${-current * 100}vh)`;
      slides.forEach((s, i) => s.classList.toggle('in-view', i === current));
      return true;
    }
    goTo(0);

    // Watch when the slides container enters / leaves the viewport
    const visIO = new IntersectionObserver(entries => {
      entries.forEach(e => { active = e.intersectionRatio >= 0.95; });
    }, { threshold: 0.95 });
    visIO.observe(fpSlides);

    // Wheel handler — intercept only when the container is fully visible
    fpSlides.addEventListener('wheel', e => {
      if (!active) return;
      e.preventDefault();
      if (busy) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      // At last slide scrolling down → let page continue
      if (dir === 1 && current === total - 1) { active = false; return; }
      // At first slide scrolling up → let page continue
      if (dir === -1 && current === 0) { active = false; return; }
      busy = true;
      goTo(current + dir);
      setTimeout(() => { busy = false; }, 750);
    }, { passive: false });

    // Touch support
    let touchY = null;
    fpSlides.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
    fpSlides.addEventListener('touchend', e => {
      if (!active || touchY === null) return;
      const diff = touchY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 40) return;
      const dir = diff > 0 ? 1 : -1;
      if (dir === 1 && current === total - 1) { active = false; return; }
      if (dir === -1 && current === 0) { active = false; return; }
      if (!busy) { busy = true; goTo(current + dir); setTimeout(() => { busy = false; }, 750); }
      touchY = null;
    }, { passive: true });
  }

  // Admissions page — GSAP ScrollTrigger stacked cards (pins each card, then
  // gently scales it down as the next one arrives). Skipped on mobile,
  // reduced-motion, and low-end devices, where the cards just stack normally.
  function initAdmissionsCards() {
    if (document.body.dataset.page !== 'admissions') return;
    const cards = document.querySelectorAll('.c-card');
    if (!cards.length) return;
    if (REDUCE_FX || window.innerWidth <= 900) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0;
    const cardsArr = gsap.utils.toArray(cards);
    const lastCardIndex = cardsArr.length - 1;

    const lastCardST = ScrollTrigger.create({
      trigger: cardsArr[lastCardIndex],
      start: 'center center',
    });

    cardsArr.forEach((card, index) => {
      const scale = index === lastCardIndex ? 1 : 0.92;
      const scaleDown = gsap.to(card, { scale, ease: 'none' });
      ScrollTrigger.create({
        trigger: card,
        start: `top top+=${headerOffset}`,
        end: () => lastCardST.start,
        pin: true,
        pinSpacing: false,
        scrub: 0.5,
        ease: 'none',
        animation: scaleDown,
        toggleActions: 'restart none none reverse',
      });
    });
  }
  initAdmissionsCards();

  // ---------------------------------------------------------------------
  // Scroll-position-driven effects, batched into a single rAF tick so low
  // powered devices do one read/write pass per frame instead of several.
  // ---------------------------------------------------------------------
  const heroBg = document.querySelector('.hero-bg img');
  const hScroll = document.querySelector('.h-scroll');
  const hTrack = hScroll?.querySelector('.h-track');
  const hBar = hScroll?.querySelector('.h-progress .bar');
  const hSlideImgs = hScroll ? hScroll.querySelectorAll('.h-slide img') : [];
  const stackCards = document.querySelectorAll('.stack-card');
  const admTrack = document.querySelector('.adm-track');
  const admBar = document.querySelector('.adm-progress .bar');
  const isDesktopWide = () => window.innerWidth > 900;

  function updateHeader() {
    if (!header || isLight) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  }

  function updateHeroParallax() {
    if (!heroBg || REDUCE_FX) return;
    heroBg.style.setProperty('--parallax', `${window.scrollY * 0.25}px`);
  }

  function updateHGallery() {
    if (!hScroll || !hTrack) return;
    if (!isDesktopWide() || REDUCE_FX) { hTrack.style.transform = ''; hSlideImgs.forEach(i => i.style.transform = ''); return; }
    const rect = hScroll.getBoundingClientRect();
    const total = hScroll.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const p = total > 0 ? scrolled / total : 0;
    const maxX = hTrack.scrollWidth - window.innerWidth;
    hTrack.style.transform = `translate3d(${-p * maxX}px,0,0)`;
    if (hBar) hBar.style.width = `${p * 100}%`;
    hSlideImgs.forEach((img) => {
      const slideRect = img.getBoundingClientRect();
      const centerDist = (slideRect.left + slideRect.width / 2) - window.innerWidth / 2;
      const norm = centerDist / window.innerWidth;
      img.style.transform = `translate3d(${-norm * 40}px,0,0) scale(1.15)`;
    });
  }

  function updateStackCards() {
    if (!stackCards.length) return;
    const mobile = !isDesktopWide();
    stackCards.forEach((card) => {
      if (mobile || REDUCE_FX) { card.style.transform = ''; card.style.opacity = ''; return; }
      const rect = card.getBoundingClientRect();
      const topOffset = parseInt(getComputedStyle(card).top) || 100;
      const progress = Math.max(0, Math.min(1, (topOffset - rect.top) / (window.innerHeight * 0.8)));
      card.style.transform = `scale(${1 - progress * 0.08})`;
      card.style.opacity = 1 - progress * 0.3;
    });
  }

  // Admissions page — thin reading-progress bar under the header that fills
  // as visitors scroll through the five-stage journey.
  function updateAdmissionsProgress() {
    if (!admTrack || !admBar) return;
    const rect = admTrack.getBoundingClientRect();
    const total = admTrack.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    const p = total > 0 ? scrolled / total : 0;
    admBar.style.width = `${Math.max(0, Math.min(1, p)) * 100}%`;
  }

  // Global reading-progress bar under the header for all pages
  const globalProgressBar = document.querySelector('.site-progress-bar .bar');
  function updateGlobalScrollProgress() {
    if (!globalProgressBar) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const p = Math.min(1, Math.max(0, window.scrollY / docHeight));
    globalProgressBar.style.width = `${p * 100}%`;
  }

  // Subtle image parallax on scroll for hero & two-column imagery
  const parallaxImgs = document.querySelectorAll('.page-hero .hero-img img, .two-col .col-img img');
  function updateParallaxImages() {
    if (REDUCE_FX || !isDesktopWide()) return;
    parallaxImgs.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.bottom >= -50 && rect.top <= window.innerHeight + 50) {
        const offset = ((rect.top + rect.height / 2) - window.innerHeight / 2) * 0.05;
        img.style.setProperty('--scroll-y', `${offset}px`);
      }
    });
  }

  let ticking = false;
  function onScrollFrame() {
    updateHeader();
    updateHeroParallax();
    updateGlobalScrollProgress();
    updateParallaxImages();
    updateHGallery();
    updateStackCards();
    updateAdmissionsProgress();
    ticking = false;
  }
  function requestTick() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  onScrollFrame();
}

function boot() {
  renderHeader();
  renderFooter();
  initInteractions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}