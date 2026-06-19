document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. PAGE TRANSITIONS (SUNKOSHI SVG WAVE)
  // ==========================================
  function initRiverTransition() {
    const container = document.getElementById('river-transition');
    const path1 = document.getElementById('river-path-1');
    const path2 = document.getElementById('river-path-2');
    const path3 = document.getElementById('river-path-3');

    if (!container || !path1 || !path2 || !path3) return;

    const W = 1440, H = 900;
    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    function buildWavePath(xOffset, amplitude, frequency, phase, isEnter) {
      const pts = [];
      if (isEnter) {
        // ENTER: wave is leading edge on the right, filled to the left (-200)
        const waveX = xOffset + W;
        pts.push(`M ${waveX} 0`);
        for (let y = 0; y <= H; y += 20) {
          const x = waveX + Math.sin((y / H) * Math.PI * frequency + phase) * amplitude;
          pts.push(`L ${x} ${y}`);
        }
        pts.push(`L -200 ${H}`);
        pts.push(`L -200 0`);
      } else {
        // EXIT: wave is trailing edge on the left, filled to the right (W + 200)
        pts.push(`M ${xOffset} 0`);
        for (let y = 0; y <= H; y += 20) {
          const x = xOffset + Math.sin((y / H) * Math.PI * frequency + phase) * amplitude;
          pts.push(`L ${x} ${y}`);
        }
        pts.push(`L ${W + 200} ${H}`);
        pts.push(`L ${W + 200} 0`);
      }
      pts.push('Z');
      return pts.join(' ');
    }

    // --- EXIT phase (runs on page load) ---
    container.style.opacity = '1';
    container.style.pointerEvents = 'all';

    // Set initial full coverage
    path1.setAttribute('d', buildWavePath(0, 80, 2.5, 0, false));
    path2.setAttribute('d', buildWavePath(0, 60, 2, 1.2, false));
    path3.setAttribute('d', buildWavePath(0, 100, 3, 0.8, false));

    const exitDuration = 600;
    const exitStart = performance.now();

    function runExit(now) {
      const elapsed = now - exitStart;
      
      // Path 3 leads, Path 2 is delayed by 80ms, Path 1 trails by 160ms
      const t3 = Math.min(1, Math.max(0, elapsed / exitDuration));
      const t2 = Math.min(1, Math.max(0, (elapsed - 80) / exitDuration));
      const t1 = Math.min(1, Math.max(0, (elapsed - 160) / exitDuration));

      const offset3 = 1440 * easeInOutCubic(t3);
      const offset2 = 1440 * easeInOutCubic(t2);
      const offset1 = 1440 * easeInOutCubic(t1);

      path3.setAttribute('d', buildWavePath(offset3, 100, 3, 0.8, false));
      path2.setAttribute('d', buildWavePath(offset2, 60, 2, 1.2, false));
      path1.setAttribute('d', buildWavePath(offset1, 80, 2.5, 0, false));

      if (t1 < 1) {
        requestAnimationFrame(runExit);
      } else {
        container.style.opacity = '0';
        container.style.pointerEvents = 'none';
      }
    }

    requestAnimationFrame(runExit);

    // --- ENTER phase ---
    window.runRiverEnter = function(targetUrl) {
      container.style.pointerEvents = 'all';
      container.style.opacity = '1';

      const enterDuration = 700;
      const enterStart = performance.now();

      function animateEnter(now) {
        const elapsed = now - enterStart;
        
        // Path 1 leads, Path 2 is delayed by 80ms, Path 3 trails by 160ms
        const t1 = Math.min(1, Math.max(0, elapsed / enterDuration));
        const t2 = Math.min(1, Math.max(0, (elapsed - 80) / enterDuration));
        const t3 = Math.min(1, Math.max(0, (elapsed - 160) / enterDuration));

        const offset1 = -1440 + (1440 * easeInOutCubic(t1));
        const offset2 = -1440 + (1440 * easeInOutCubic(t2));
        const offset3 = -1440 + (1440 * easeInOutCubic(t3));

        path1.setAttribute('d', buildWavePath(offset1, 80, 2.5, 0, true));
        path2.setAttribute('d', buildWavePath(offset2, 60, 2, 1.2, true));
        path3.setAttribute('d', buildWavePath(offset3, 100, 3, 0.8, true));

        if (t3 < 1) {
          requestAnimationFrame(animateEnter);
        } else {
          window.location.href = targetUrl;
        }
      }

      requestAnimationFrame(animateEnter);
    };

    // Intercept all internal link clicks
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#') 
          && !href.startsWith('mailto') && !href.startsWith('tel')
          && !link.hasAttribute('target')) {
        link.addEventListener('click', e => {
          e.preventDefault();
          window.runRiverEnter(href);
        });
      }
    });
  }


  // ==========================================
  // 2. HEADER SCROLL SHIFT
  // ==========================================
  const header = document.querySelector('header');
  const handleScroll = () => {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial run


  // ==========================================
  // 3. PARALLAX HERO CAROUSEL
  // ==========================================
  const heroCarousel = document.querySelector('.hero-carousel');
  if (heroCarousel) {
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      window.requestAnimationFrame(() => {
        heroCarousel.style.transform = `translate3d(0, ${scrollPos * 0.4}px, 0)`;
      });
    });
  }


  // ==========================================
  // 4. STATS COUNTER STRIP COUNT-UP
  // ==========================================
  const statsStrip = document.querySelector('.stats-strip');
  if (statsStrip) {
    const statsNumbers = document.querySelectorAll('.stat-number');
    
    const countUp = (element) => {
      const targetText = element.getAttribute('data-target');
      let targetVal = parseInt(targetText);
      let suffix = '';
      
      if (targetText.includes('+')) {
        targetVal = parseInt(targetText.replace('+', ''));
        suffix = '+';
      } else if (targetText.includes('%')) {
        targetVal = parseInt(targetText.replace('%', ''));
        suffix = '%';
      } else if (targetText === '∞') {
        targetVal = 88; // Animate to 88, then swap to infinity
        suffix = '∞';
      }
      
      let currentVal = 0;
      const duration = 1500; // 1.5s
      const steps = 60;
      const stepTime = duration / steps;
      const increment = targetVal / steps;
      
      const timer = setInterval(() => {
        currentVal += increment;
        if (currentVal >= targetVal) {
          clearInterval(timer);
          element.textContent = suffix === '∞' ? '∞' : Math.round(targetVal) + suffix;
        } else {
          element.textContent = suffix === '∞' ? Math.round(currentVal) : Math.round(currentVal) + suffix;
        }
      }, stepTime);
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statsNumbers.forEach(num => countUp(num));
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    statsObserver.observe(statsStrip);
  }


  // ==========================================
  // 5. MOBILE NAVIGATION DRAWER
  // ==========================================
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navDrawer = document.getElementById('mobile-nav-drawer');
  
  if (mobileMenuBtn && navDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      navDrawer.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        if (navDrawer.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });

    // Close mobile drawer when clicking a drawer link
    const drawerLinks = navDrawer.querySelectorAll('a');
    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        navDrawer.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      });
    });
  }


  // ==========================================
  // 6. GLOBAL SCROLL REVEALS
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  
  revealElements.forEach(el => revealObserver.observe(el));


  // ==========================================
  // 7. LIGHTBOX GALLERY
  // ==========================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length > 0) {
    // Dynamic Lightbox HTML Injection
    const lightboxHtml = `
      <div class="lightbox" id="lightbox">
        <button class="lightbox-close" id="lightbox-close" aria-label="Close Lightbox"><i class="fas fa-times"></i></button>
        <button class="lightbox-prev" id="lightbox-prev" aria-label="Previous Image"><i class="fas fa-chevron-left"></i></button>
        <div class="lightbox-content">
          <img src="" alt="Resort Gallery Preview" id="lightbox-img">
        </div>
        <button class="lightbox-next" id="lightbox-next" aria-label="Next Image"><i class="fas fa-chevron-right"></i></button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHtml);

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    let activeImages = [];
    let currentImgIndex = 0;

    const updateActiveImages = () => {
      activeImages = [];
      galleryItems.forEach(item => {
        if (item.style.display !== 'none') {
          const img = item.querySelector('img');
          if (img) activeImages.push(img.src);
        }
      });
    };

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        updateActiveImages();
        const clickedImgSrc = item.querySelector('img').src;
        currentImgIndex = activeImages.indexOf(clickedImgSrc);
        
        lightboxImg.src = clickedImgSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    const showPrevImg = (e) => {
      e.stopPropagation();
      currentImgIndex = (currentImgIndex - 1 + activeImages.length) % activeImages.length;
      lightboxImg.src = activeImages[currentImgIndex];
    };

    const showNextImg = (e) => {
      e.stopPropagation();
      currentImgIndex = (currentImgIndex + 1) % activeImages.length;
      lightboxImg.src = activeImages[currentImgIndex];
    };

    lightboxPrev.addEventListener('click', showPrevImg);
    lightboxNext.addEventListener('click', showNextImg);

    // Keyboard handlers
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevImg(e);
      if (e.key === 'ArrowRight') showNextImg(e);
    });

    // Gallery Category filtering
    const filterTabs = document.querySelectorAll('.filter-tab');
    if (filterTabs.length > 0) {
      filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          filterTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const category = tab.dataset.filter;

          galleryItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
              item.style.display = 'block';
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
              }, 50);
            } else {
              item.style.opacity = '0';
              item.style.transform = 'scale(0.8)';
              setTimeout(() => {
                item.style.display = 'none';
              }, 300);
            }
          });
        });
      });
    }
  }


  // ==========================================
  // 8. CONTACT FORM SUBMISSION
  // ==========================================
  const inquiryForm = document.getElementById('inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

      if (!email || !subject || !message) {
        alert('Please fill in all required fields marked with *');
        return;
      }

      const formPanel = inquiryForm.closest('.form-panel');
      if (formPanel) {
        formPanel.innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem;">
            <div style="font-size: 3rem; color: var(--color-accent); margin-bottom: 1.5rem;">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 2rem; color: var(--text-dark); margin-bottom: 1rem;">Thank You For Your Query</h3>
            <p style="color: var(--text-muted); font-size: 1rem; max-width: 420px; margin: 0 auto 2rem auto; line-height: 1.7;">
              Our customer management team has received your message. We will respond to your email as soon as possible.
            </p>
            <button class="btn-cta btn-cta-solid" onclick="window.location.reload()">Send Another Message</button>
          </div>
        `;
      }
    });
  }


  // ==========================================
  // 9. FOOTER NEWSLETTER FORM SUBMIT
  // ==========================================
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim()) {
        const parentContainer = newsletterForm.parentElement;
        newsletterForm.style.display = 'none';
        
        const successMsg = document.createElement('p');
        successMsg.style.color = 'var(--color-accent)';
        successMsg.style.fontSize = '0.9rem';
        successMsg.style.marginTop = '1rem';
        successMsg.textContent = 'Thank you for subscribing to our seasonal offers!';
        parentContainer.appendChild(successMsg);
      }
    });
  }
  // ==========================================
  // 10. HERO CAROUSEL AUTO-PLAY
  // ==========================================
  function initHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    if (slides.length === 0) return;

    let currentIndex = 0;
    const intervalTime = 4000;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      dots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }

    let carouselInterval = setInterval(nextSlide, intervalTime);

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(carouselInterval);
        currentIndex = i;
        showSlide(currentIndex);
        carouselInterval = setInterval(nextSlide, intervalTime);
      });
    });

    showSlide(currentIndex);
  }

  // Initialize Transitions, Carousel, and Video Panel
  initRiverTransition();
  initHeroCarousel();

  const videoPanel = document.querySelector('.hero-video-panel');
  if (videoPanel) {
    setTimeout(() => {
      videoPanel.classList.add('visible');
    }, 1800);
  }

});
