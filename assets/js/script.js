'use strict';

/* =========================================================
   Ananny Royzada — Portfolio interactions
   Vanilla JS, no dependencies.
   ========================================================= */

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/* ---------- Theme ---------- */
const themeToggle = $('[data-theme-toggle]');
const themeMeta = $('meta[name="theme-color"]');

function syncThemeUI() {
  const isDark = root.dataset.theme === 'dark';

  if (themeToggle) {
    const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
  }

  if (themeMeta) {
    themeMeta.setAttribute('content', isDark ? '#070b12' : '#f7f9fc');
  }
}

function setTheme(theme, persist = true) {
  root.dataset.theme = theme;
  syncThemeUI();

  if (persist) {
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      /* storage can be unavailable in private mode */
    }
  }
}

syncThemeUI();

themeToggle?.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (event) => {
  try {
    if (!localStorage.getItem('theme')) {
      setTheme(event.matches ? 'light' : 'dark', false);
    }
  } catch (error) {
    /* ignore */
  }
});

/* ---------- Header, scroll progress, back to top ---------- */
const header = $('[data-header]');
const progressBar = $('[data-scroll-progress]');
const backToTop = $('[data-back-to-top]');

function updateScrollUI() {
  const y = window.scrollY;

  header?.classList.toggle('is-scrolled', y > 12);

  if (progressBar) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;
    progressBar.style.width = `${progress * 100}%`;
  }

  backToTop?.classList.toggle('is-visible', y > 600);
}

let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;

  window.requestAnimationFrame(() => {
    updateScrollUI();
    scrollTicking = false;
  });
}, { passive: true });

updateScrollUI();

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
});

/* ---------- Mobile menu ---------- */
const menuToggle = $('[data-menu-toggle]');
const primaryNav = $('#primary-nav');

function setMenu(open) {
  if (!header || !menuToggle) return;

  header.classList.toggle('nav-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  root.classList.toggle('menu-open', open);
}

menuToggle?.addEventListener('click', () => {
  setMenu(!header.classList.contains('nav-open'));
});

$$('a', primaryNav || document).forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setMenu(false);
  }
});

window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});

/* ---------- Active navigation link ---------- */
const navLinks = $$('a', primaryNav || document);
const sections = $$('[data-section]');

if ('IntersectionObserver' in window && sections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.id;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, {
    rootMargin: '-45% 0px -50% 0px',
    threshold: 0
  });

  sections.forEach((section) => navObserver.observe(section));
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.forEach((item) => item.classList.remove('is-active'));
    link.classList.add('is-active');
  });
});

/* ---------- Reveal on scroll ---------- */
const revealItems = $$('.reveal');

if (revealItems.length) {
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealItems.forEach((item) => revealObserver.observe(item));
  }
}

/* ---------- Animated counters ---------- */
const counters = $$('[data-counter]');

function formatCounter(value, decimals) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function animateCounter(element) {
  const target = Number.parseFloat(element.dataset.to || '0');
  const decimals = Number.parseInt(element.dataset.decimals || '0', 10);
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';

  if (!Number.isFinite(target)) return;

  if (reduceMotion.matches) {
    element.textContent = `${prefix}${formatCounter(target, decimals)}${suffix}`;
    return;
  }

  const duration = 1200;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;

    element.textContent = `${prefix}${formatCounter(value, decimals)}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(frame);
    }
  }

  window.requestAnimationFrame(frame);
}

if (counters.length) {
  if (!('IntersectionObserver' in window)) {
    counters.forEach((counter) => animateCounter(counter));
  } else {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    counters.forEach((counter) => counterObserver.observe(counter));
  }
}

/* ---------- Project filtering ---------- */
const filterButtons = $$('[data-filter]');
const projectCards = $$('[data-project-card]');
const projectCount = $('[data-project-count]');

function applyFilter(filter) {
  let visible = 0;

  projectCards.forEach((card) => {
    const matches = filter === 'all' || card.dataset.category === filter;
    card.hidden = !matches;

    if (matches) {
      visible += 1;

      if (!reduceMotion.matches && typeof card.animate === 'function') {
        card.animate(
          [
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'none' }
          ],
          { duration: 320, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' }
        );
      }
    }
  });

  if (projectCount) {
    projectCount.textContent = `${visible} project${visible === 1 ? '' : 's'}`;
  }

  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => applyFilter(button.dataset.filter));
});

/* ---------- Project case-study dialog ---------- */
const dialog = $('#project-dialog');
const dialogImg = $('#dialog-img');
const dialogTitle = $('#dialog-title');
const dialogCategory = $('#dialog-category');
const dialogContent = $('#dialog-content');
const dialogGithub = $('#dialog-github');
let lastFocusedElement = null;

function openProject(projectId, trigger) {
  if (!dialog) return;

  const template = document.getElementById(`project-${projectId}`);
  const card = trigger?.closest('[data-project-card]');

  if (!template || !card) return;

  lastFocusedElement = trigger || document.activeElement;

  if (dialogImg) {
    const image = card.querySelector('.project-media img');
    if (image) {
      dialogImg.src = image.currentSrc || image.src;
      dialogImg.alt = image.alt;
    }
  }

  if (dialogTitle) dialogTitle.textContent = card.dataset.title || 'Project';
  if (dialogCategory) dialogCategory.textContent = card.dataset.categoryLabel || 'Case study';
  if (dialogGithub) dialogGithub.href = card.dataset.github || 'https://github.com/Anannyroyzada';

  if (dialogContent) {
    dialogContent.replaceChildren(template.content.cloneNode(true));
  }

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }

  root.classList.add('dialog-open');
  $('.dialog-close', dialog)?.focus();
}

function closeProject() {
  if (!dialog) return;

  if (typeof dialog.close === 'function' && dialog.open) {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
    root.classList.remove('dialog-open');
    lastFocusedElement?.focus();
  }
}

$$('[data-open-project]').forEach((button) => {
  button.addEventListener('click', () => openProject(button.dataset.openProject, button));
});

$$('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', closeProject);
});

dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) closeProject();
});

dialog?.addEventListener('close', () => {
  root.classList.remove('dialog-open');
  lastFocusedElement?.focus();
});

/* ---------- Toast ---------- */
const toast = $('#toast');
let toastTimer = null;

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('is-visible');

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2600);
}

/* ---------- Copy email ---------- */
async function copyEmail() {
  const email = 'ananny1807@gmail.com';

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(email);
    } else {
      const helper = document.createElement('textarea');
      helper.value = email;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }

    showToast('Email copied — talk soon.');
  } catch (error) {
    window.location.href = `mailto:${email}`;
  }
}

$$('[data-copy-email]').forEach((button) => {
  button.addEventListener('click', copyEmail);
});

/* ---------- Contact form ---------- */
const contactForm = $('[data-contact-form]');

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  const data = new FormData(contactForm);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const message = String(data.get('message') || '').trim();

  const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);

  showToast('Opening your email app…');
  window.location.href = `mailto:ananny1807@gmail.com?subject=${subject}&body=${body}`;
});

/* ---------- Footer year ---------- */
$$('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
