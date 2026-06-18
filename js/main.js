document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. STICKY HEADER EFFECT
  // ==========================================
  const header = document.querySelector('header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check in case of refresh

  // ==========================================
  // 2. MOBILE NAVIGATION MENU
  // ==========================================
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  // ==========================================
  // 3. HOME PAGE HERO SLIDER
  // ==========================================
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length > 1) {
    let currentSlide = 0;
    const nextSlide = () => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    };
    setInterval(nextSlide, 5000); // Change image every 5 seconds
  }

  // ==========================================
  // 4. GALLERY FILTER
  // ==========================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterTabs.length > 0 && galleryItems.length > 0) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Toggle active tab class
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

  // ==========================================
  // 5. GALLERY LIGHTBOX MODAL
  // ==========================================
  const galleryGrid = document.querySelector('.gallery-grid');
  if (galleryGrid) {
    // Inject lightbox HTML dynamically
    const lightboxHtml = `
      <div class="lightbox" id="lightbox">
        <button class="lightbox-close" id="lightbox-close"><i class="fas fa-times"></i></button>
        <button class="lightbox-prev" id="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
        <div class="lightbox-content">
          <img src="" alt="Resort Image Preview" id="lightbox-img">
        </div>
        <button class="lightbox-next" id="lightbox-next"><i class="fas fa-chevron-right"></i></button>
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

    // Get list of active images (taking into account filters)
    const updateActiveImages = () => {
      activeImages = [];
      galleryItems.forEach(item => {
        if (item.style.display !== 'none') {
          const img = item.querySelector('img');
          if (img) activeImages.push(img.src);
        }
      });
    };

    // Open lightbox
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        updateActiveImages();
        const clickedImgSrc = item.querySelector('img').src;
        currentImgIndex = activeImages.indexOf(clickedImgSrc);
        
        lightboxImg.src = clickedImgSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop scroll
      });
    });

    // Close lightbox
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = ''; // Resume scroll
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Prev/Next Actions
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

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevImg(e);
      if (e.key === 'ArrowRight') showNextImg(e);
    });
  }

  // ==========================================
  // 6. CONTACT FORM SUBMISSION SIMULATION
  // ==========================================
  const inquiryForm = document.getElementById('inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Form validation
      const email = document.getElementById('email').value.strip ? document.getElementById('email').value.strip() : document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

      if (!email || !subject || !message) {
        alert('Please fill in all required fields marked with *');
        return;
      }

      // Hide form contents, show success message
      const formCard = inquiryForm.closest('.contact-form-panel');
      if (formCard) {
        formCard.innerHTML = `
          <div style="text-align: center; padding: var(--spacing-lg) 0;">
            <div style="font-size: 4rem; color: var(--color-accent); margin-bottom: var(--spacing-sm);">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3 style="color: var(--color-primary); font-size: 1.8rem; margin-bottom: var(--spacing-sm);">Thank You For Your Query!</h3>
            <p style="color: var(--color-text-muted); font-size: 1.1rem; line-height: 1.6; max-width: 400px; margin: 0 auto;">
              Our customer management team has received your message and check-in dates. We will contact you back as soon as possible via email.
            </p>
            <button class="btn btn-primary" style="margin-top: var(--spacing-md);" onclick="window.location.reload()">Send Another Inquiry</button>
          </div>
        `;
      }
    });
  }
});
