/* =============================================
   HIREDEPTH — MAIN.JS
   Scroll animations, nav, interactions
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAV SCROLL STATE ----
  const nav = document.getElementById('nav');

  const updateNav = () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();


  // ---- MOBILE MENU ----
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  let menuOpen = false;

  hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    const spans = hamburger.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });


  // ---- SCROLL REVEAL ----
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));


  // ---- STEP HOVER CONNECTOR HIGHLIGHT ----
  const steps = document.querySelectorAll('.step');
  steps.forEach((step, i) => {
    step.addEventListener('mouseenter', () => {
      step.style.borderColor = 'rgba(201, 168, 76, 0.35)';
    });
    step.addEventListener('mouseleave', () => {
      step.style.borderColor = '';
    });
  });


  // ---- ANIMAL CARD MICRO INTERACTION ----
  const animalCards = document.querySelectorAll('.animal-card');
  animalCards.forEach(card => {
    const emoji = card.querySelector('.animal-emoji');
    card.addEventListener('mouseenter', () => {
      if (emoji) {
        emoji.style.transform = 'scale(1.15)';
        emoji.style.transition = 'transform 0.25s ease';
      }
    });
    card.addEventListener('mouseleave', () => {
      if (emoji) {
        emoji.style.transform = 'scale(1)';
      }
    });
  });


  // ---- CTA FORM SUBMISSION ----
  const ctaForm = document.getElementById('cta-form');
  if (ctaForm) {
    ctaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = ctaForm.querySelector('.cta-input');
      const email = input ? input.value : '';

      const successHTML = `
        <div class="form-success">
          <strong>You're on the list.</strong><br/>
          We'll be in touch within 24 hours at <em>${email}</em>.
        </div>
      `;
      ctaForm.outerHTML = successHTML;
    });
  }


  // ---- SMOOTH SCROLL FOR ANCHOR LINKS ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ---- STAT COUNTER ANIMATION ----
  const stats = document.querySelectorAll('.stat-num');

  const animateStat = (el) => {
    const raw = el.textContent.trim();
    const suffix = raw.replace(/[\d.]/g, '');
    const value = parseFloat(raw);
    if (isNaN(value)) return;

    let start = 0;
    const duration = 1400;
    const startTime = performance.now();
    const isDecimal = raw.includes('.');

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (value - start) * eased;
      el.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => statObserver.observe(stat));


  // ---- PARALLAX: HERO RING ----
  const heroRing = document.querySelector('.hero-accent-ring');
  if (heroRing) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroRing.style.transform = `translateY(${y * 0.12}px)`;
      }
    }, { passive: true });
  }


  // ---- FEATURE CARD TOP BORDER ANIMATION ----
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    const accent = card.querySelector('.card-accent');
    if (!accent) return;
    if (card.classList.contains('card-featured')) return; // always on

    card.addEventListener('mouseenter', () => {
      accent.style.background = 'linear-gradient(90deg, transparent, var(--gold), transparent)';
    });
    card.addEventListener('mouseleave', () => {
      accent.style.background = '';
    });
  });

});
