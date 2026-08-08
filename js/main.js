// Les Grand'Ames — shared front-end behaviour

(function () {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const isHome = document.body.classList.contains('home');
  const heroWrap = document.querySelector('.hero-pin-wrap');

  /* ---------- scroll-driven hero dissolve (pinned hero, see .hero-pin-wrap) ---------- */
  function onScroll() {
    if (isHome && heroWrap) {
      const scrollBudget = heroWrap.offsetHeight - window.innerHeight;
      const progress = scrollBudget > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollBudget)) : 1;
      root.style.setProperty('--hero-progress', progress.toFixed(3));
      // the hamburger sits white as long as the fixed photo is still visible behind its
      // top-left corner — that's true until the next section's opaque top edge (at
      // heroWrap's full height, not just the sticky "budget") scrolls past it
      header.classList.toggle('scrolled', window.scrollY >= heroWrap.offsetHeight - 60);
      header.classList.toggle('revealed', progress > 0.05);
    } else if (header) {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }
  }
  document.addEventListener('scroll', onScroll, { passive: true });
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
    const modalDeposit = modalOverlay.querySelector('[data-modal-deposit]');
    const modalForm = modalOverlay.querySelector('form');

    document.querySelectorAll('[data-book]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        modalTitle.textContent = btn.dataset.book;
        modalSub.textContent = btn.dataset.date || '';
        modalDeposit.textContent = btn.dataset.deposit
          ? `Acompte à régler à la réservation : ${btn.dataset.deposit}`
          : '';
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
        modalForm.innerHTML =
          '<p style="font-weight:700;">Merci ! 🌸 Cette démo n\'est pas reliée à un paiement réel — pour finaliser ta réservation, écris-nous sur <a href="https://www.instagram.com/les.grand.ames/" target="_blank" rel="noopener" style="text-decoration:underline;">@les.grand.ames</a>.</p>';
      });
    }
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
})();
