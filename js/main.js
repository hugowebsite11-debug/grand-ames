// Les Grand'Ames — shared front-end behaviour

(function () {
  const header = document.querySelector('.site-header');
  const isHome = document.body.classList.contains('home');
  const heroWrap = document.querySelector('.hero-pin-wrap');
  const card = document.querySelector('.intro-card');
  const darkHeroEl = document.querySelector('.photo-hero');

  /* ---------- hero stays pinned (frozen) until the intro card has fully slid into
     place, then releases and scrolling continues normally ---------- */
  function onScroll() {
    if (isHome && heroWrap) {
      const budget = heroWrap.offsetHeight - window.innerHeight;
      let p = budget > 0 ? window.scrollY / budget : 1;
      p = Math.min(1, Math.max(0, p));
      if (card) {
        card.style.setProperty('--card-progress', p.toFixed(3));
        card.classList.toggle('pinning', p < 1);
      }
      /* header/logo/burger must stay white for as long as the pinned photo is still
         on screen — that's the full hero-pin-wrap height, not just the pin budget
         (the sticky photo itself still needs its own viewport height to scroll away) */
      if (header) header.classList.toggle('scrolled', window.scrollY >= heroWrap.offsetHeight);
    } else if (header) {
      const threshold = darkHeroEl ? darkHeroEl.offsetHeight : 40;
      header.classList.toggle('scrolled', window.scrollY > threshold);
    }
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- scroll-progress frame (violet outline that completes at page bottom) ---------- */
  (function setupScrollFrame() {
    const NS = 'http://www.w3.org/2000/svg';
    const STROKE = 3;
    const INSET = STROKE / 2;

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'scroll-frame');
    svg.setAttribute('aria-hidden', 'true');
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke-width', STROKE);
    svg.appendChild(rect);
    document.body.appendChild(svg);

    let perimeter = 0;

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      const rw = w - INSET * 2;
      const rh = h - INSET * 2;
      rect.setAttribute('x', INSET);
      rect.setAttribute('y', INSET);
      rect.setAttribute('width', rw);
      rect.setAttribute('height', rh);
      perimeter = 2 * (rw + rh);
      rect.setAttribute('stroke-dasharray', perimeter);
      updateFrameProgress();
    }

    function updateFrameProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1;
      rect.setAttribute('stroke-dashoffset', perimeter * (1 - progress));
    }

    window.addEventListener('resize', resize);
    document.addEventListener('scroll', updateFrameProgress, { passive: true });
    resize();
  })();

  /* ---------- mobile nav ---------- */
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.main-nav');
  const navClose = document.querySelector('.nav-close');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('open');
      burger.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        burger.classList.remove('open');
      })
    );
    if (navClose) {
      navClose.addEventListener('click', () => {
        nav.classList.remove('open');
        burger.classList.remove('open');
      });
    }
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- booking modal (ateliers page) ---------- */
  const modalOverlay = document.querySelector('.modal-overlay');
  if (modalOverlay) {
    const modalTitle = modalOverlay.querySelector('[data-modal-title]');
    const modalSub = modalOverlay.querySelector('[data-modal-sub]');
    const modalPrice = modalOverlay.querySelector('[data-modal-price]');
    const modalForm = modalOverlay.querySelector('form');
    let currentOutdoor = false;

    document.querySelectorAll('[data-book]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        modalTitle.textContent = btn.dataset.book;
        modalSub.textContent = btn.dataset.date || '';
        modalPrice.textContent = btn.dataset.price
          ? `Montant à régler en intégralité à la réservation : ${btn.dataset.price}`
          : '';
        currentOutdoor = btn.dataset.outdoor === '1';
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    if (modalForm) {
      modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const outdoorNote = currentOutdoor
          ? '<p>Cette expérience se déroule en extérieur : un groupe Instagram sera créé afin de te permettre de localiser précisément le groupe sur place.</p>'
          : '';
        modalForm.innerHTML =
          '<p style="font-weight:700;">Merci pour ta réservation !</p>' +
          '<p>Un e-mail te sera envoyé 48h avant l\'expérience avec toutes les informations concernant le point de rendez-vous et l\'organisation.</p>' +
          outdoorNote +
          '<p class="modal-note">Cette démo n\'est pas reliée à un prestataire de paiement réel — pour finaliser ta réservation dès maintenant, écris-nous sur <a href="https://www.instagram.com/les.grand.ames/" target="_blank" rel="noopener" style="text-decoration:underline;">@les.grand.ames</a>.</p>';
      });
    }
  }

  /* ---------- club privé adhésion (club-prive page) ---------- */
  const joinClubBtn = document.querySelector('[data-join-club]');
  if (joinClubBtn) {
    joinClubBtn.addEventListener('click', () => {
      const note = document.createElement('p');
      note.className = 'modal-note';
      note.style.marginTop = '16px';
      note.innerHTML =
        'Cette démo n\'est pas reliée à un prestataire de paiement réel — pour rejoindre le club privé dès maintenant, écris-nous sur <a href="https://www.instagram.com/les.grand.ames/" target="_blank" rel="noopener" style="text-decoration:underline;">@les.grand.ames</a>.';
      joinClubBtn.insertAdjacentElement('afterend', note);
      joinClubBtn.disabled = true;
    });
  }

  /* ---------- generic contact form (partenariat page) ---------- */
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = document.createElement('p');
      note.style.fontWeight = '700';
      note.style.marginTop = '14px';
      note.textContent = 'Merci pour ton message ! On te répond très vite. 💌';
      contactForm.appendChild(note);
      contactForm.querySelectorAll('input, textarea, select, button').forEach((el) => (el.disabled = true));
    });
  }

  /* ---------- retreat interest form (retraites page) ---------- */
  const retreatForm = document.querySelector('.retreat-form');
  if (retreatForm) {
    retreatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = document.createElement('p');
      note.className = 'modal-note';
      note.style.fontWeight = '700';
      note.style.marginTop = '14px';
      note.innerHTML =
        'Merci ! Tu seras tenue informée dès l\'annonce de la prochaine retraite. 💌<br><span style="font-weight:400;">Cette démo n\'est pas reliée à un envoi réel — pour être sûre d\'être prévenue, écris-nous dès maintenant sur <a href="https://www.instagram.com/les.grand.ames/" target="_blank" rel="noopener" style="text-decoration:underline;">@les.grand.ames</a>.</span>';
      retreatForm.appendChild(note);
      retreatForm.querySelectorAll('input, textarea, select, button').forEach((el) => (el.disabled = true));
    });
  }
})();
