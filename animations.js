/* ═══════════════════════════════════════════════════════════════════
   ANIMATIONS.JS — Sid Perfume
   GSAP / ScrollTrigger Premium Animation Suite
   ═══════════════════════════════════════════════════════════════════ */
'use strict';

/* ───────────────────────────────────────────────
   UTILITIES
   ─────────────────────────────────────────────── */
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ───────────────────────────────────────────────
   TEXT SPLIT & REVEAL (no SplitText plugin)
   Splits text into chars/wraps them for staggered animation
   ─────────────────────────────────────────────── */
class TextReveal {
  constructor(el, options = {}) {
    this.el = el;
    this.options = Object.assign({
      type: 'chars',    // chars | words | lines
      stagger: 0.02,
      duration: 0.8,
      fromVars: { opacity: 0, y: 60, rotationX: -90 },
      toVars: { opacity: 1, y: 0, rotationX: 0 },
      ease: 'power3.out',
    }, options);

    if (this.options.type === 'chars') this.splitChars();
    else if (this.options.type === 'words') this.splitWords();
  }

  splitChars() {
    const text = this.el.textContent;
    this.el.textContent = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:inline-block;overflow:hidden;';
    this.el.style.display = 'inline-block';

    [...text].forEach((char, i) => {
      if (char === ' ') {
        const space = document.createElement('span');
        space.innerHTML = '&nbsp;';
        space.style.cssText = 'display:inline-block;';
        wrapper.appendChild(space);
        return;
      }
      const span = document.createElement('span');
      span.textContent = char;
      span.dataset.index = i;
      span.style.cssText = 'display:inline-block;transform-origin:50% 100%;';
      wrapper.appendChild(span);
    });

    this.el.appendChild(wrapper);
    this.spans = wrapper.querySelectorAll('span');
  }

  splitWords() {
    const text = this.el.textContent;
    this.el.textContent = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:inline-block;overflow:hidden;';
    this.el.style.display = 'inline-block';

    text.split(/(\s+)/).forEach((word, i) => {
      const span = document.createElement('span');
      span.innerHTML = word;
      span.style.cssText = 'display:inline-block;transform-origin:50% 100%;';
      wrapper.appendChild(span);
    });

    this.el.appendChild(wrapper);
    this.spans = wrapper.querySelectorAll('span');
  }

  animate() {
    if (!this.spans || this.spans.length === 0) return;
    const { stagger, duration, fromVars, toVars, ease } = this.options;

    gsap.set(this.spans, fromVars);
    return gsap.to(this.spans, {
      ...toVars,
      duration,
      stagger,
      ease,
    });
  }
}

/* ───────────────────────────────────────────────
   HERO SECTION — SCALE-DOWN INTRO
   Full-screen hero scales down on scroll into framed container
   ─────────────────────────────────────────────── */
function initHeroScaleDown() {
  // Check if we have the right DOM structure
  const hero = document.getElementById('hero');
  const heroContent = document.getElementById('heroContent');
  const scrollIndicator = document.querySelector('.hero-scroll-indicator');
  if (!hero || !heroContent || prefersReducedMotion()) return;

  // Create a scale-down container wrapper
  const heroInner = document.createElement('div');
  heroInner.className = 'hero-scale-container';
  while (hero.firstChild) heroInner.appendChild(hero.firstChild);
  hero.appendChild(heroInner);

  // Store original hero padding for calculations
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '+=120%',
      scrub: 1.2,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
    }
  });

  // Scale the entire hero section down as user scrolls
  tl.to(heroInner, {
    scale: 0.75,
    opacity: 0.3,
    borderRadius: '32px',
    ease: 'power2.inOut',
  }, 0)
  .to(heroContent, {
    y: -60,
    scale: 0.85,
    ease: 'power2.in',
  }, 0)
  .to(scrollIndicator, {
    opacity: 0,
    ease: 'power2.out',
  }, 0);

  // Pull it up slightly so it doesn't disappear off-screen
  tl.to(heroInner, {
    y: -window.innerHeight * 0.1,
    ease: 'power2.in',
  }, 0);

  // Refresh ScrollTrigger on resize
  const handleRefresh = debounce(() => ScrollTrigger.refresh(), 250);
  window.addEventListener('resize', handleRefresh);
}

/* ───────────────────────────────────────────────
   VARIABLE FONT MORPHING
   Morph font-weight/width on mouse movement
   ─────────────────────────────────────────────── */
function initVariableFontMorphing() {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle || prefersReducedMotion()) return;

  // Use CSS variable font axes
  heroTitle.style.fontVariationSettings = "'wght' 700, 'wdth' 100";

  document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    // Map mouse to font-weight (300-900) and width (75-125)
    const weight = 300 + (1 - y) * 600;
    const width = 75 + x * 50;

    heroTitle.style.fontVariationSettings = `'wght' ${Math.round(weight)}, 'wdth' ${Math.round(width)}`;
  });
}

/* ───────────────────────────────────────────────
   HERO TEXT REVEAL ON LOAD
   ─────────────────────────────────────────────── */
function initHeroTextReveal() {
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroBadge = document.querySelector('.hero-badge');
  const heroActions = document.querySelector('.hero-actions');
  const heroStats = document.querySelector('.hero-stats');
  if (prefersReducedMotion()) {
    // Just show everything
    [heroBadge, heroSubtitle, heroActions, heroStats].forEach(el => {
      if (el) el.style.opacity = '1';
    });
    return;
  }

  const tl = gsap.timeline({ delay: 0.6 });

  if (heroBadge) {
    gsap.set(heroBadge, { opacity: 0, y: 20 });
    tl.to(heroBadge, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0);
  }

  if (heroTitle) {
    // Split the typing area text differently
    const typingText = document.getElementById('typingText');
    if (typingText) {
      // Animate the typing cursor
      const cursor = document.querySelector('.typing-cursor');
      if (cursor) {
        gsap.set(cursor, { opacity: 0 });
        tl.to(cursor, { opacity: 1, duration: 0.3 }, 0.2);
      }
    }
  }

  if (heroSubtitle) {
    gsap.set(heroSubtitle, { opacity: 0, y: 30 });
    tl.to(heroSubtitle, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.3);
  }

  if (heroActions) {
    gsap.set(heroActions, { opacity: 0, y: 20 });
    tl.to(heroActions, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.6);
  }

  if (heroStats) {
    gsap.set(heroStats, { opacity: 0, y: 20 });
    tl.to(heroStats, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.8);
  }
}

/* ───────────────────────────────────────────────
   HORIZONTAL SCROLL SECTION
   Luxury magazine-style horizontal product showcase
   ─────────────────────────────────────────────── */
function initHorizontalScroll() {
  const container = document.querySelector('.horizontal-scroll-container');
  const track = document.querySelector('.horizontal-scroll-track');
  if (!container || !track || prefersReducedMotion()) return;

  const sections = track.querySelectorAll('.horizontal-scroll-panel');
  if (sections.length === 0) return;

  // Calculate total scroll width
  const totalWidth = track.scrollWidth;

  gsap.to(track, {
    x: () => -(totalWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      end: () => `+=${totalWidth}`,
      invalidateOnRefresh: true,
    }
  });

  // Parallax on individual panels
  sections.forEach((panel, i) => {
    const img = panel.querySelector('img');
    const info = panel.querySelector('.h-scroll-info');
    if (img) {
      gsap.to(img, {
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          containerAnimation: ScrollTrigger.getById('horizontalScroll'),
          start: 'left center',
          end: 'right center',
          scrub: 1,
        }
      });
    }
    if (info) {
      gsap.from(info, {
        opacity: 0, y: 40,
        scrollTrigger: {
          trigger: panel,
          containerAnimation: ScrollTrigger.getById('horizontalScroll'),
          start: 'left center',
          end: 'center center',
          scrub: 1,
        }
      });
    }
  });

  const handleRefresh = debounce(() => ScrollTrigger.refresh(), 250);
  window.addEventListener('resize', handleRefresh);
}

/* ───────────────────────────────────────────────
   CARD STACK / DECK UNFOLDING
   Sections stack like cards and peel apart on scroll
   ─────────────────────────────────────────────── */
function initCardStack() {
  const stack = document.querySelector('.card-stack');
  if (!stack || prefersReducedMotion()) return;

  const cards = stack.querySelectorAll('.card-stack-item');
  if (cards.length === 0) return;

  // Set initial z-indexes and transforms
  cards.forEach((card, i) => {
    const offset = i * 8;
    const scale = 1 - i * 0.02;
    gsap.set(card, {
      zIndex: cards.length - i,
      scale: scale,
      y: offset,
    });
  });

  // Create a ScrollTrigger for each card to peel away
  cards.forEach((card, i) => {
    if (i === 0) return; // Last one stays

    gsap.to(card, {
      y: -50,
      scale: 1,
      opacity: 0.6,
      rotation: (i % 2 === 0 ? 3 : -3),
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        end: 'top 30%',
        scrub: 1,
        invalidateOnRefresh: true,
      }
    });
  });
}

/* ───────────────────────────────────────────────
   3D TILT / PARALLAX ON PRODUCT CARDS
   ─────────────────────────────────────────────── */
function init3DTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  if (cards.length === 0 || prefersReducedMotion()) return;

  cards.forEach(card => {
    const maxTilt = 15;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const tiltX = (y - 0.5) * maxTilt;
      const tiltY = (0.5 - x) * maxTilt;

      // Track mouse position for parallax on child elements
      const shine = card.querySelector('.tilt-shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(212,175,55,0.15) 0%, transparent 60%)`;
      }

      gsap.to(card, {
        rotationX: tiltX,
        rotationY: tiltY,
        transformPerspective: 1200,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
      });
      const shine = card.querySelector('.tilt-shine');
      if (shine) {
        shine.style.background = 'transparent';
      }
    });
  });
}

/* ───────────────────────────────────────────────
   MAGNETIC CURSOR SNAPPING
   Buttons/links attract the cursor with GSAP physics
   ─────────────────────────────────────────────── */
function initMagneticSnap() {
  const elements = document.querySelectorAll('[data-magnetic]');
  if (elements.length === 0 || prefersReducedMotion()) return;

  elements.forEach(el => {
    const strength = parseFloat(el.dataset.magneticStrength) || 0.3;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)',
      });
    });
  });
}

/* ───────────────────────────────────────────────
   ELASTIC / GOOEY UI BUTTONS
   SVG gooey filter + GSAP spring animation on click
   ─────────────────────────────────────────────── */
function initGooeyButtons() {
  const buttons = document.querySelectorAll('[data-gooey]');
  if (buttons.length === 0 || prefersReducedMotion()) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Create a gooey blob
      const blob = document.createElement('span');
      blob.className = 'gooey-blob';
      blob.style.cssText = `
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--gold), var(--gold-dark));
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        filter: url(#goo);
      `;
      this.appendChild(blob);

      gsap.set(blob, { scale: 0, opacity: 0.6 });
      gsap.to(blob, {
        scale: 2.5,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          if (blob.parentNode) blob.parentNode.removeChild(blob);
        }
      });
    });
  });
}

/* ───────────────────────────────────────────────
   KINETIC TEXT MARQUEE
   Looping typography that changes speed on scroll
   ─────────────────────────────────────────────── */
function initKineticMarquee() {
  const marquee = document.querySelector('.kinetic-marquee');
  if (!marquee || prefersReducedMotion()) return;

  const text = marquee.querySelector('.kinetic-marquee-text');
  if (!text) return;

  // Clone content for seamless loop
  const originalContent = text.innerHTML;
  text.innerHTML = originalContent + ' &nbsp;·&nbsp; ' + originalContent + ' &nbsp;·&nbsp; ' + originalContent;
  text.style.whiteSpace = 'nowrap';

  // Base speed
  let speed = 0.5;
  let position = 0;
  let animationId = null;
  let lastScrollY = window.scrollY;

  function animateMarquee() {
    position -= speed;
    text.style.transform = `translateX(${position}px)`;

    // Half-width reset for seamless loop
    const textWidth = text.scrollWidth / 3;
    if (Math.abs(position) >= textWidth) {
      position = 0;
    }

    animationId = requestAnimationFrame(animateMarquee);
  }

  animateMarquee();

  // Change speed on scroll
  window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    const scrollSpeed = Math.abs(delta);

    // Map scroll speed to marquee speed
    speed = 0.5 + scrollSpeed * 0.02;
    speed = Math.min(speed, 4); // cap max speed
  }, { passive: true });

  // Store cleanup
  marquee._cleanupMarquee = () => {
    if (animationId) cancelAnimationFrame(animationId);
  };

  // Smoothly return to base speed when idle
  let speedTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(speedTimeout);
    speedTimeout = setTimeout(() => {
      // Gradually return to base speed
      const returnInterval = setInterval(() => {
        speed *= 0.95;
        if (speed < 0.51) {
          speed = 0.5;
          clearInterval(returnInterval);
        }
      }, 50);
    }, 2000);
  }, { passive: true });
}

/* ───────────────────────────────────────────────
   SECTION BACKGROUND CROSSFADE
   Smooth color transition between sections on scroll
   ─────────────────────────────────────────────── */
function initSectionCrossfade() {
  const sections = document.querySelectorAll('[data-crossfade]');
  if (sections.length < 2 || prefersReducedMotion()) return;

  sections.forEach((section, i) => {
    if (i === 0) return;

    const prevSection = sections[i - 1];
    const currentBg = window.getComputedStyle(section).backgroundImage || window.getComputedStyle(section).backgroundColor;

    gsap.fromTo(section,
      { opacity: 0.85 },
      {
        opacity: 1,
        duration: 1.5,
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 40%',
          scrub: 1,
          invalidateOnRefresh: true,
        }
      }
    );
  });
}

/* ───────────────────────────────────────────────
   UPDATE EXISTING GLASS CARDS WITH GSAP TILT
   Override the CSS-only glass card tilt with GSAP-driven spring physics
   ─────────────────────────────────────────────── */
function initGsapGlassCards() {
  const cards = document.querySelectorAll('.glass-card.tilt-card-gsap');
  if (cards.length === 0 || prefersReducedMotion()) return;

  cards.forEach(card => {
    const maxTilt = 12;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const tiltX = (y - 0.5) * maxTilt;
      const tiltY = (0.5 - x) * maxTilt;

      gsap.to(card, {
        rotationX: tiltX,
        rotationY: tiltY,
        transformPerspective: 1200,
        boxShadow: '0 20px 60px rgba(212,175,55,0.15)',
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      // Parallax on child image
      const img = card.querySelector('img');
      if (img) {
        gsap.to(img, {
          x: -(x - 0.5) * 10,
          y: -(y - 0.5) * 10,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
      });

      const img = card.querySelector('img');
      if (img) {
        gsap.to(img, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        });
      }
    });
  });
}

/* ───────────────────────────────────────────────
   MASTER INITIALIZER
   ─────────────────────────────────────────────── */
function initAllAnimations() {
  // Only run if GSAP is available
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded — skipping premium animations');
    return;
  }

  // Register ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Initialize all animation modules
  // Order matters for perceived performance

  // 1. Hero - immediate load
  setTimeout(() => {
    initHeroTextReveal();
    initVariableFontMorphing();
  }, 100);

  // 2. Hero scale-down (needs ScrollTrigger)
  setTimeout(() => {
    initHeroScaleDown();
    initKineticMarquee();
  }, 300);

  // 3. Scroll-triggered animations
  setTimeout(() => {
    initHorizontalScroll();
    initCardStack();
    initSectionCrossfade();
  }, 500);

  // 4. Interactive mouse-driven
  setTimeout(() => {
    init3DTiltCards();
    initMagneticSnap();
    initGooeyButtons();
    initGsapGlassCards();
  }, 800);

  // Refresh ScrollTrigger after all timelines are created
  if (typeof ScrollTrigger !== 'undefined') {
    setTimeout(() => ScrollTrigger.refresh(), 1000);
  }

  // Debounced resize refresh
  const handleRefresh = debounce(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 250);
  window.addEventListener('resize', handleRefresh);

  // Reduced motion listener for dynamic changes
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change', () => {
    // Kill all GSAP animations if user enables reduced motion
    if (motionQuery.matches) {
      gsap.globalTimeline.clear();
      ScrollTrigger.getAll().forEach(st => st.kill());
    }
  });
}

/* ───────────────────────────────────────────────
   CLEANUP — destroy all GSAP timelines and ScrollTriggers
   ─────────────────────────────────────────────── */
function cleanupAllAnimations() {
  // Kill all GSAP tweens
  gsap.globalTimeline.clear();

  // Kill all ScrollTriggers
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.getAll().forEach(st => st.kill());
  }

  // Cleanup marquees
  document.querySelectorAll('.kinetic-marquee').forEach(el => {
    if (el._cleanupMarquee) el._cleanupMarquee();
  });
}