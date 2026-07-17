// Divine Care — Static Site JS
// -----------------------------------------------------------------------------
// Header + footer are injected here so we only maintain them in one place.
// Every HTML page just needs <div id="site-header"></div> and <div id="site-footer"></div>.
// -----------------------------------------------------------------------------

const NAV_LINKS = [
  ['index.html', 'Home'],
  ['about.html', 'About'],
  ['care.html', 'Our Care'],
  ['homes.html', 'Homes'],
  ['life.html', 'Life'],
  ['experience.html', 'Experience'],
  ['admissions.html', 'Admissions'],
  ['fees.html', 'Fees'],
  ['news.html', 'Journal'],
  ['careers.html', 'Careers'],
  ['contact.html', 'Contact'],
];

function renderHeader() {
  const host = document.getElementById('site-header');
  if (!host) return;
  const variant = host.dataset.variant || 'dark'; // 'dark' = transparent-over-hero, 'light' = solid white
  const cls = variant === 'light' ? 'site-header light' : 'site-header';
  host.outerHTML = `
<header class="${cls}">
  <div class="container nav">
    <a href="index.html" class="brand">
      <img src="logo.png" alt="Divine Care Homes Scotland" />
      <span class="brand-text">Divine Care<small>Homes Scotland</small></span>
    </a>
    <ul class="nav-links">
      ${NAV_LINKS.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}
    </ul>
    <a class="btn" href="contact.html">Book a visit</a>
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
        <a href="index.html" class="brand" style="color:#fff;margin-bottom:20px">
          <img src="logo.png" alt="Divine Care Homes Scotland" style="filter:brightness(0) invert(1)" />
          <span class="brand-text">Divine Care<small>Homes Scotland</small></span>
        </a>
        <p style="max-width:280px;margin-top:16px">Compassionate residential, nursing and specialist care across Scotland. Centenary House Nursing Home &amp; sister homes.</p>
      </div>
      <div>
        <h4>Explore</h4>
        <ul>
          <li><a href="about.html">About</a></li>
          <li><a href="care.html">Our care</a></li>
          <li><a href="homes.html">Homes</a></li>
          <li><a href="life.html">Life</a></li>
          <li><a href="experience.html">Experience</a></li>
        </ul>
      </div>
      <div>
        <h4>Support</h4>
        <ul>
          <li><a href="admissions.html">Admissions</a></li>
          <li><a href="fees.html">Fees</a></li>
          <li><a href="careers.html">Careers</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li>0000 000 0000</li>
          <li>enquiries@divinecarehomes.co.uk</li>
          <li>Centenary House Nursing Home,<br/>Scotland</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Divine Care Homes Scotland Ltd.</span>
      <span>Privacy · Cookies · Modern Slavery</span>
    </div>
  </div>
</footer>`;
}

// -----------------------------------------------------------------------------
// Everything below runs AFTER the header/footer are in the DOM
// -----------------------------------------------------------------------------
function initInteractions() {
  // Header scroll state
  const header = document.querySelector('.site-header');
  const isLight = header?.classList.contains('light');
  function onScroll() {
    if (!header || isLight) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Hero parallax
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      heroBg.style.setProperty('--parallax', `${window.scrollY * 0.25}px`);
    }, { passive: true });
  }

  // Stat counters
  const stats = document.querySelectorAll('.stat .num[data-target]');
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const dur = 1800; const start = performance.now();
      function tick(t) {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = (target % 1 ? val.toFixed(1) : Math.round(val).toLocaleString()) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  stats.forEach(s => statIO.observe(s));

  // Accordion
  document.querySelectorAll('.acc-item .acc-q').forEach(q => {
    q.addEventListener('click', () => q.parentElement.classList.toggle('open'));
  });

  // Horizontal parallax gallery
  const hScroll = document.querySelector('.h-scroll');
  if (hScroll && window.innerWidth > 900) {
    const track = hScroll.querySelector('.h-track');
    const bar = hScroll.querySelector('.h-progress .bar');
    const slides = hScroll.querySelectorAll('.h-slide img');
    function updateH() {
      const rect = hScroll.getBoundingClientRect();
      const total = hScroll.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      const maxX = track.scrollWidth - window.innerWidth;
      track.style.transform = `translate3d(${-p * maxX}px,0,0)`;
      if (bar) bar.style.width = `${p * 100}%`;
      slides.forEach((img) => {
        const slideRect = img.getBoundingClientRect();
        const centerDist = (slideRect.left + slideRect.width / 2) - window.innerWidth / 2;
        const norm = centerDist / window.innerWidth;
        img.style.transform = `translate3d(${-norm * 40}px,0,0) scale(1.15)`;
      });
    }
    window.addEventListener('scroll', updateH, { passive: true });
    window.addEventListener('resize', updateH);
    updateH();
  }

  // Stacked cards effect
  const stackCards = document.querySelectorAll('.stack-card');
  if (stackCards.length) {
    function updateStack() {
      stackCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const topOffset = parseInt(getComputedStyle(card).top) || 100;
        const progress = Math.max(0, Math.min(1, (topOffset - rect.top) / (window.innerHeight * 0.8)));
        const scale = 1 - progress * 0.08;
        const opacity = 1 - progress * 0.3;
        card.style.transform = `scale(${scale})`;
        card.style.opacity = opacity;
      });
    }
    window.addEventListener('scroll', updateStack, { passive: true });
    updateStack();
  }

  // Sticky full-page slides — active dot indicator
  const fpSlides = document.querySelector('.fp-slides');
  if (fpSlides) {
    const slides = fpSlides.querySelectorAll('.fp-slide');
    const nav = document.querySelector('.fp-nav');
    if (nav) {
      nav.innerHTML = '';
      slides.forEach((s, i) => {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Slide ${i + 1}`);
        b.addEventListener('click', () => s.scrollIntoView({ behavior: 'smooth' }));
        nav.appendChild(b);
      });
      const dots = nav.querySelectorAll('button');
      const slideIO = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = [...slides].indexOf(e.target);
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
          }
        });
      }, { root: fpSlides, threshold: 0.5 });
      slides.forEach(s => slideIO.observe(s));
    }
  }
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
