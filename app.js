/* ═══════════════════════════════════════════════════════════════════
   APP.JS — Sid Perfume
   Premium Interactivity | Animations | Particle System
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

// ─── DOM READY ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ═════════════════════════════════════════════════════════════════
  // 1. PRE-LOADER
  // ═════════════════════════════════════════════════════════════════
  (function initLoader() {
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loaderBar');
    const siteWrapper = document.getElementById('siteWrapper');
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        loaderBar.style.width = '100%';
        setTimeout(() => {
          loader.classList.add('hidden');
          siteWrapper.classList.add('visible');
          // Kick off animations after loader
          setTimeout(() => {
            initTypingAnimation();
            initCounters();
            initBundleCounter();
          }, 400);
        }, 600);
      }
      loaderBar.style.width = progress + '%';
    }, 200);
  })();

  // ═════════════════════════════════════════════════════════════════
  // 2. CUSTOM CURSOR
  // ═════════════════════════════════════════════════════════════════
  (function initCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    // Smooth ring follow
    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('[data-cursor-hover], button, a, .ambassador-card');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
  })();

  // ═════════════════════════════════════════════════════════════════
  // 3. TYPING ANIMATION
  // ═════════════════════════════════════════════════════════════════
  function initTypingAnimation() {
    const textEl = document.getElementById('typingText');
    const phrases = [
      'Scents That Define Your Legacy...',
      'Crafted for the Champions...',
      'Where Power Meets Elegance...'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function type() {
      const currentPhrase = phrases[phraseIndex];

      if (!isDeleting) {
        textEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 80;

        if (charIndex === currentPhrase.length) {
          isDeleting = true;
          typeSpeed = 2000; // Pause at end
        }
      } else {
        textEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 40;

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          typeSpeed = 500; // Pause before next
        }
      }

      setTimeout(type, typeSpeed);
    }

    type();
  }

  // ═════════════════════════════════════════════════════════════════
  // 4. PARTICLE BACKGROUND (Canvas)
  // ═════════════════════════════════════════════════════════════════
  (function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;
    let mouseXP = 0, mouseYP = 0;

    function resizeCanvas() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.hue = Math.random() > 0.5 ? 45 : 0; // Gold or crimson tint
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction - gentle pull
        const dx = mouseXP - this.x;
        const dy = mouseYP - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (200 - dist) / 200 * 0.02;
          this.x += dx * force;
          this.y += dy * force;
        }

        if (this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const color = this.hue === 45 ? '212, 175, 55' : '230, 57, 70';
        ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
        ctx.fill();
      }
    }

    const particleCount = Math.min(80, Math.floor(canvas.width * canvas.height / 10000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.08 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connectParticles();
      animFrame = requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // Track mouse for particle interaction
    document.querySelector('.hero-section').addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseXP = e.clientX - rect.left;
      mouseYP = e.clientY - rect.top;
    });
  })();

  // ═════════════════════════════════════════════════════════════════
  // 5. NAVBAR
  // ═════════════════════════════════════════════════════════════════
  (function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('navHamburger');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = navLinks.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Active link based on scroll position
      const sections = ['hero', 'worldcup', 'fifa', 'celebrities', 'about'];
      let current = 'hero';
      sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 200) {
            current = id;
          }
        }
      });

      navLinkItems.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    });

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Close menu on link click
    navLinkItems.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  })();

  // ═════════════════════════════════════════════════════════════════
  // 6. SCROLL REVEAL (Intersection Observer)
  // ═════════════════════════════════════════════════════════════════
  (function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  })();

  // ═════════════════════════════════════════════════════════════════
  // 7. ANIMATED COUNTERS (Hero Stats)
  // ═════════════════════════════════════════════════════════════════
  function initCounters() {
    const counters = document.querySelectorAll('.hero-stat-num');

    counters.forEach(counter => {
      const target = parseFloat(counter.dataset.count);
      const isFloat = target % 1 !== 0;
      const duration = 2500;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        if (isFloat) {
          counter.textContent = current.toFixed(1);
        } else {
          counter.textContent = Math.floor(current).toLocaleString();
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = isFloat ? target.toFixed(1) : Math.floor(target).toLocaleString();
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // ═════════════════════════════════════════════════════════════════
  // 8. BUNDLE COUNTER
  // ═════════════════════════════════════════════════════════════════
  function initBundleCounter() {
    const fill = document.getElementById('bundleCounterFill');
    const percentEl = document.getElementById('bundleCounterPercent');
    if (!fill || !percentEl) return;

    const targetPercent = 87;
    const duration = 2000;
    const startTime = performance.now();

    function animateBundle(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * targetPercent;

      fill.style.width = current + '%';
      percentEl.textContent = Math.floor(current) + '%';

      if (progress < 1) {
        requestAnimationFrame(animateBundle);
      } else {
        fill.style.width = targetPercent + '%';
        percentEl.textContent = targetPercent + '%';
      }
    }

    // Start when section is in view
    const worldcupSection = document.getElementById('worldcup');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(animateBundle);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    if (worldcupSection) observer.observe(worldcupSection);
  }

  // ═════════════════════════════════════════════════════════════════
  // 9. FIFA COUNTDOWN TIMER
  // ═════════════════════════════════════════════════════════════════
  (function initFifaTimer() {
    const daysEl = document.getElementById('timerDays');
    const hoursEl = document.getElementById('timerHours');
    const minsEl = document.getElementById('timerMins');
    const secsEl = document.getElementById('timerSecs');

    // Set target to 5 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    targetDate.setHours(12, 30, 45, 0);

    function updateTimer() {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        secsEl.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(mins).padStart(2, '0');
      secsEl.textContent = String(secs).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  })();

  // ═════════════════════════════════════════════════════════════════
  // 10. CELEBRITY CTA BUTTON
  // ═════════════════════════════════════════════════════════════════
  (function initCelebrityCta() {
    const cta = document.querySelector('.celebrity-cta');
    if (!cta) return;

    cta.addEventListener('click', function(e) {
      e.preventDefault();
      const originalText = this.textContent;
      this.textContent = '✓ Coming Soon';
      setTimeout(() => {
        this.textContent = originalText;
      }, 2000);
    });
  })();

  // ═════════════════════════════════════════════════════════════════
  // 11. GSAP — ScrollTrigger & Parallax
  // ═════════════════════════════════════════════════════════════════
  (function initGsapAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') return;

    // Register ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Parallax for FIFA bottle on scroll
    const bottle = document.getElementById('fifaBottle');
    if (bottle && typeof ScrollTrigger !== 'undefined') {
      gsap.to(bottle, {
        y: 60,
        scale: 0.95,
        scrollTrigger: {
          trigger: '#fifa',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    }

    // FIFA visual glow parallax
    const fifaGlow = document.querySelector('.fifa-glow');
    if (fifaGlow && typeof ScrollTrigger !== 'undefined') {
      gsap.to(fifaGlow, {
        opacity: 0.3,
        scale: 0.8,
        scrollTrigger: {
          trigger: '#fifa',
          start: 'top bottom',
          end: 'center center',
          scrub: 1
        }
      });
    }

    // Animate section title reveals with GSAP for extra flair
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.utils.toArray('.section-header .section-title').forEach(title => {
        gsap.from(title, {
          y: 40,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });
    }
  })();

  // ═════════════════════════════════════════════════════════════════
  // 12. CTA BUTTON INTERACTIONS
  // ═════════════════════════════════════════════════════════════════
  (function initCtaButtons() {
    // All primary CTAs
    const ctaButtons = document.querySelectorAll('.deal-cta, .fifa-cta, .hero-cta, .hero-cta-alt, #navCta');

    ctaButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();

        // Visual feedback
        const originalText = this.textContent;
        this.textContent = '✓ Added';
        this.style.pointerEvents = 'none';

        // Create particle burst on click
        createClickBurst(e);

        setTimeout(() => {
          this.textContent = originalText;
          this.style.pointerEvents = 'auto';
        }, 2000);
      });
    });

    function createClickBurst(e) {
      const burst = document.createElement('div');
      burst.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 99999;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 4px;
        height: 4px;
        background: var(--gold, #D4AF37);
        border-radius: 50%;
      `;
      document.body.appendChild(burst);

      const particles = [];
      for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        const angle = (i / 6) * Math.PI * 2;
        const velocity = 30 + Math.random() * 30;
        p.style.cssText = `
          position: absolute;
          width: 3px;
          height: 3px;
          background: ${i % 2 === 0 ? '#D4AF37' : '#E63946'};
          border-radius: 50%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        `;
        burst.appendChild(p);

        const startTime = performance.now();
        const duration = 600 + Math.random() * 200;

        function animateParticle(now) {
          const elapsed = now - startTime;
          const progress = elapsed / duration;
          if (progress >= 1) {
            p.remove();
            return;
          }
          const x = Math.cos(angle) * velocity * progress;
          const y = Math.sin(angle) * velocity * progress;
          p.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
          p.style.opacity = 1 - progress;
          requestAnimationFrame(animateParticle);
        }

        requestAnimationFrame(animateParticle);
      }

      setTimeout(() => burst.remove(), 1000);
    }
  })();

  // ═════════════════════════════════════════════════════════════════
  // 13. GLASS CARD MOUSE TRACKING
  // ═════════════════════════════════════════════════════════════════
  (function initGlassTracking() {
    const glassCards = document.querySelectorAll('.glass-card');

    glassCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Subtle rotation based on mouse position
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform =
          `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        card.classList.add('hover-glow');
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.classList.remove('hover-glow');
      });
    });
  })();

  // ═════════════════════════════════════════════════════════════════
  // 14. NEWSLETTER FORM
  // ═════════════════════════════════════════════════════════════════
  (function initNewsletter() {
    const form = document.getElementById('footerForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input.value.trim()) {
        const btn = form.querySelector('button');
        btn.textContent = '✓';
        btn.style.background = 'linear-gradient(135deg, #064E3B, #0D7A5E)';
        setTimeout(() => {
          btn.textContent = '→';
          btn.style.background = '';
          input.value = '';
        }, 2000);
      }
    });
  })();

  // ═════════════════════════════════════════════════════════════════
  // 15. DEAL STOCK ANIMATED BARS
  // ═════════════════════════════════════════════════════════════════
  (function initDealStockBars() {
    const dealCards = document.querySelectorAll('.deal-card');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector('.deal-stock-fill');
          const stockEl = entry.target.querySelector('.deal-stock');
          if (fill && stockEl) {
            const target = parseInt(stockEl.dataset.target) || 0;
            const duration = 1500;
            const startTime = performance.now();

            function animateBar(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = eased * target;

              fill.style.width = current + '%';

              if (progress < 1) {
                requestAnimationFrame(animateBar);
              } else {
                fill.style.width = target + '%';
              }
            }

            requestAnimationFrame(animateBar);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    dealCards.forEach(card => observer.observe(card));
  })();

  // ═════════════════════════════════════════════════════════════════
  // 16. WINDOW RESIZE — Re-trigger some animations if needed
  // ═════════════════════════════════════════════════════════════════
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Re-trigger ScrollTrigger refresh if GSAP is loaded
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 250);
  });

}); // End DOMContentLoaded