/* ============================================================
   STACKLY BAKERY — main.js
   All interactions, animations, and effects
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Page Loader ─────────────────────────────────────────── */
  const overlay = document.getElementById('page-overlay');

  // Inject branded loader content once
  if (overlay && !overlay.dataset.built) {
    overlay.dataset.built = '1';
    overlay.innerHTML =
      '<div class="loader-content">' +
        '<div class="loader-spinner">' +
          '<div class="loader-ring-outer"></div>' +
          '<div class="loader-ring-inner"></div>' +
          '<span class="loader-grain-dot">✦</span>' +
        '</div>' +
        '<img class="loader-logo-img" ' +
             'src="https://snabsolutions.in/wp-content/uploads/2026/02/stackly-snab-solutions.png" ' +
             'alt="Stackly Bakery" />' +
        '<span class="loader-label">Crafting your experience…</span>' +
      '</div>' +
      '<div class="loader-progress-wrap">' +
        '<div class="loader-progress-bar" id="loader-bar"></div>' +
      '</div>';
  }

  function navigateTo(url) {
    if (!overlay) { window.location.href = url; return; }
    overlay.classList.add('active');
    // progress bar completes just before navigate
    setTimeout(() => { window.location.href = url; }, 700);
  }

  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('http') &&
        !href.startsWith('mailto') && !href.startsWith('tel') &&
        !link.hasAttribute('data-no-transition')) {
      link.addEventListener('click', function (e) { e.preventDefault(); navigateTo(href); });
    }
  });

  // Dismiss overlay on normal page load
  if (overlay) {
    // briefly show exit state so bar completes, then fade out
    overlay.classList.add('active');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('exit');
        overlay.classList.remove('active');
        setTimeout(function () { overlay.classList.remove('exit'); }, 600);
      });
    });
  }

  // Fix black-screen on browser back button (bfcache):
  // DOMContentLoaded never fires from cache — pageshow always does.
  window.addEventListener('pageshow', function (e) {
    if (!overlay) return;
    if (e.persisted || overlay.classList.contains('active')) {
      overlay.classList.remove('active');
      overlay.classList.add('exit');
      setTimeout(function () { overlay.classList.remove('exit'); }, 600);
    }
  });

  /* ── Navbar Scroll ───────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── Hamburger + Mobile Menu ──────────────────────────────  */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose= document.getElementById('mobile-close');

  function openMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });
  }

  if (mobileClose) mobileClose.addEventListener('click', closeMenu);

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) closeMenu();
  });

  /* ── Hero Slider ─────────────────────────────────────────── */
  const slides         = document.querySelectorAll('.hero-slide');
  const dots           = document.querySelectorAll('.slider-dot');
  const counterCurrent = document.getElementById('slider-current');
  const counterTotal   = document.getElementById('slider-total');
  let currentSlide = 0;
  let sliderTimer  = null;

  function goToSlide(idx) {
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    currentSlide = ((idx % slides.length) + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    if (counterCurrent) counterCurrent.textContent = String(currentSlide + 1).padStart(2, '0');
  }

  function startSlider() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 5200);
  }

  if (slides.length > 0) {
    if (counterTotal) counterTotal.textContent = String(slides.length).padStart(2, '0');
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); startSlider(); }));
    goToSlide(0);
    startSlider();
  }

  /* ── Products Carousel ───────────────────────────────────── */
  const track   = document.getElementById('products-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (track) {
    let currentPos = 0;
    const cards = track.querySelectorAll('.product-card');
    const visibleCount = () => window.innerWidth < 768 ? 1 : window.innerWidth < 1100 ? 2 : 4;
    const maxPos = () => Math.max(0, cards.length - visibleCount());

    function moveCarousel(dir) {
      currentPos = Math.max(0, Math.min(currentPos + dir, maxPos()));
      const gap = 24;
      const cardWidth = (cards[0] ? cards[0].offsetWidth : 0) + gap;
      track.style.transform = `translateX(-${currentPos * cardWidth}px)`;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => moveCarousel(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => moveCarousel(1));

    setInterval(() => {
      if (currentPos >= maxPos()) currentPos = -1;
      moveCarousel(1);
    }, 4600);
  }

  /* ── Testimonials Slider ─────────────────────────────────── */
  const tTrack = document.getElementById('testimonials-track');
  const tDots  = document.querySelectorAll('.t-dot');
  let tCurrent = 0;
  let tTimer   = null;

  function goToTestimonial(idx) {
    if (tDots[tCurrent]) tDots[tCurrent].classList.remove('active');
    tCurrent = ((idx % (tDots.length || 1)) + (tDots.length || 1)) % (tDots.length || 1);
    if (tTrack) tTrack.style.transform = `translateX(-${tCurrent * 100}%)`;
    if (tDots[tCurrent]) tDots[tCurrent].classList.add('active');
  }

  if (tTrack) {
    tDots.forEach((d, i) => d.addEventListener('click', () => {
      goToTestimonial(i);
      clearInterval(tTimer);
      tTimer = setInterval(() => goToTestimonial(tCurrent + 1), 5200);
    }));
    goToTestimonial(0);
    tTimer = setInterval(() => goToTestimonial(tCurrent + 1), 5200);
  }

  /* ── Menu Tabs ───────────────────────────────────────────── */
  const tabs   = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(`panel-${target}`);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── Scroll Reveal ───────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Counter Animation ───────────────────────────────────── */
  function animateCounter(el, target, duration, suffix) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start) + (suffix || '');
      if (start >= target) clearInterval(timer);
    }, 16);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count]').forEach(el => {
          const target = parseInt(el.getAttribute('data-count'));
          const suffix = el.getAttribute('data-suffix') || '';
          animateCounter(el, target, 1600, suffix);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.stats-section').forEach(s => statsObserver.observe(s));

  /* ── Add to Cart ─────────────────────────────────────────── */
  let cartCount = 0;
  const cartBadge = document.getElementById('cart-count');

  function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast'; toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  document.querySelectorAll('.product-add, .btn-add-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      cartCount++;
      if (cartBadge) cartBadge.textContent = cartCount;
      const name = btn.closest('.product-card, .menu-item-card')
        ?.querySelector('.product-name, .menu-item-name')
        ?.textContent || 'Item';
      showToast(`✓  "${name}" added to cart`);
      btn.style.transform = 'scale(1.4)';
      setTimeout(() => { btn.style.transform = ''; }, 340);
    });
  });

  /* ── Newsletter ──────────────────────────────────────────── */
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input && input.value) {
        showToast('🎉 Subscribed! Welcome to Stackly Bakery.');
        input.value = '';
      }
    });
  });

  /* ── Contact Form ────────────────────────────────────────── */
  const contactFormEl = document.getElementById('contact-form');
  const successEl     = document.getElementById('cf-success');
  if (contactFormEl) {
    contactFormEl.addEventListener('submit', function (e) {
      e.preventDefault();
      contactFormEl.style.opacity = '0.4';
      contactFormEl.style.pointerEvents = 'none';
      setTimeout(() => {
        contactFormEl.style.display = 'none';
        if (successEl) successEl.classList.add('show');
      }, 420);
    });
  }

  /* ── FAQ Toggle ──────────────────────────────────────────── */
  window.toggleFaq = function (el) {
    const answer = el.nextElementSibling;
    const isOpen = el.classList.contains('open');
    document.querySelectorAll('.faq-question').forEach(q => {
      q.classList.remove('open');
      q.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) { el.classList.add('open'); answer.classList.add('open'); }
  };

  /* ── Highlight today's hours ─────────────────────────────── */
  const dayMap = { 0:'sun',1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat' };
  const todayId  = 'day-' + dayMap[new Date().getDay()];
  const todayRow = document.getElementById(todayId);
  if (todayRow) {
    todayRow.classList.add('today');
    const daySpan = todayRow.querySelector('.hours-day');
    const dot = document.createElement('span');
    dot.className = 'today-dot';
    daySpan.prepend(dot);
  }

  /* ── Shop sidebar filters ────────────────────────────────── */
  document.querySelectorAll('.sidebar-list li').forEach(li => {
    li.addEventListener('click', () => {
      li.closest('ul')?.querySelectorAll('li').forEach(i => i.classList.remove('active'));
      li.classList.add('active');
    });
  });

  /* ── Parallax ────────────────────────────────────────────── */
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    document.querySelectorAll('.hero-slide.active picture img').forEach(img => {
      img.style.transform = `scale(1) translateY(${scrolled * 0.22}px)`;
    });
    const innerBg = document.querySelector('.inner-hero picture img');
    if (innerBg) innerBg.style.transform = `scale(1.06) translateY(${scrolled * 0.18}px)`;
    const contactBg = document.querySelector('.contact-hero-bg');
    if (contactBg) contactBg.style.transform = `scale(1.08) translateY(${scrolled * 0.12}px)`;
  }, { passive: true });

  /* ── Active nav link ─────────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active');
  });

  /* ── Magnetic button hover ───────────────────────────────── */
  if (window.innerWidth > 768) {
    document.querySelectorAll('.btn-primary, .cf-submit, .nav-cta').forEach(el => {
      el.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top  - rect.height / 2;
        this.style.transform = `translate(${x * 0.12}px, ${y * 0.14}px)`;
      });
      el.addEventListener('mouseleave', function () { this.style.transform = ''; });
    });
  }

  /* ── Card shine on hover ─────────────────────────────────── */
  document.querySelectorAll('.product-card, .menu-item-card, .cat-card').forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      this.style.setProperty('--shine-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      this.style.setProperty('--shine-y', ((e.clientY - rect.top)  / rect.height * 100) + '%');
    });
  });

  /* ── Cursor glow (desktop) ───────────────────────────────── */
  if (window.innerWidth > 768) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position:fixed;width:280px;height:280px;border-radius:50%;
      background:radial-gradient(circle,rgba(200,136,74,0.055) 0%,transparent 70%);
      pointer-events:none;transform:translate(-50%,-50%);z-index:0;
      will-change:left,top; transition:opacity 0.3s;
    `;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }

  /* ── Ambient floating particles on home ─────────────────── */
  if (document.querySelector('.hero-home')) {
    const symbols = ['✦','✧','·','○','◦','∘'];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('span');
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const size = Math.random() * 10 + 5;
      p.className = 'particle';
      p.style.cssText = `
        font-size:${size}px;
        color:rgba(200,136,74,${Math.random() * 0.08 + 0.02});
        left:${Math.random() * 100}vw;
        top:${Math.random() * 100}vh;
        animation-duration:${9 + Math.random() * 10}s;
        animation-delay:${Math.random() * 6}s;
      `;
      document.body.appendChild(p);
    }
  }

  /* ── Tilt on testimonial images ──────────────────────────── */
  document.querySelectorAll('.testimonial-img, .about-story-img').forEach(el => {
    el.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      this.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale(1.02)`;
    });
    el.addEventListener('mouseleave', function () { this.style.transform = ''; });
  });

  /* ── Timeline border animate ─────────────────────────────── */
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (timelineItems.length) {
    const tlObs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const body = entry.target.querySelector('.timeline-body');
          if (body) setTimeout(() => {
            body.style.borderLeftColor = 'var(--caramel)';
            body.style.borderLeftWidth = '3px';
          }, i * 80);
          tlObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    timelineItems.forEach(item => tlObs.observe(item));
  }

  /* ── Marquee hover pause ─────────────────────────────────── */
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () => { marqueeTrack.style.animationPlayState = 'paused'; });
    marqueeTrack.addEventListener('mouseleave', () => { marqueeTrack.style.animationPlayState = 'running'; });
  }

  /* ── Stat number morph on hover ──────────────────────────── */
  document.querySelectorAll('.stat-item').forEach(item => {
    const numEl = item.querySelector('[data-count]');
    if (!numEl) return;
    const target = parseInt(numEl.getAttribute('data-count'));
    const suffix = numEl.getAttribute('data-suffix') || '';
    item.addEventListener('mouseenter', () => {
      const flash = setInterval(() => {
        numEl.textContent = Math.floor(Math.random() * target) + suffix;
      }, 55);
      setTimeout(() => { clearInterval(flash); numEl.textContent = target + suffix; }, 480);
    });
  });

  /* ── Instagram hover stagger ─────────────────────────────── */
  document.querySelectorAll('.insta-item').forEach((item, i) => {
    item.style.transitionDelay = (i * 0.04) + 's';
  });

  /* ── Lazy image fade-in ──────────────────────────────────── */
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.55s ease';
    img.addEventListener('load', () => { img.style.opacity = '1'; });
    if (img.complete) img.style.opacity = '1';
  });

  /* ── Smooth stagger for grid cards ──────────────────────── */
  document.querySelectorAll('.categories-grid .cat-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 0.07) + 's';
  });

  /* ── Typewriter effect for hero eyebrow ─────────────────── */
  function typeWriter(el, text, delay) {
    el.textContent = '';
    let i = 0;
    setTimeout(() => {
      const timer = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i >= text.length) clearInterval(timer);
      }, 35);
    }, delay);
  }

  const activeSlide = document.querySelector('.hero-slide.active');
  if (activeSlide) {
    const eyebrow = activeSlide.querySelector('.hero-eyebrow');
    if (eyebrow) {
      const txt = eyebrow.textContent.trim();
      eyebrow.textContent = '';
      typeWriter(eyebrow, txt, 600);
    }
  }

});