'use strict';
(() => {
  const ui = window.CAKE_TEXTS || {};
  const root = document.querySelector('#dessert-showcase');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('[data-showcase-slide]'));
  const dots = Array.from(root.querySelectorAll('[data-showcase-dot]'));
  const pause = root.querySelector('[data-showcase-pause]');
  const status = root.querySelector('[data-showcase-status]');
  const count = root.querySelector('[data-showcase-count]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = motion.matches;
  let hovered = false;
  function label() {
    pause.textContent = paused ? (ui.carouselPlay || 'Автопоказ ▶') : (ui.carouselPause || 'Пауза Ⅱ');
    pause.setAttribute('aria-label', paused ? (ui.carouselPlayLabel || 'Включить автоматическую смену слайдов') : (ui.carouselPauseLabel || 'Приостановить автоматическую смену слайдов'));
  }
  function show(index, manual = false) {
    if (!Number.isInteger(index) || slides.length === 0) return;
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-pressed', String(i === current));
    });
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (manual) {
      paused = true;
      status.textContent = slides[current].getAttribute('aria-label');
      label();
    }
  }
  root.querySelector('[data-showcase-prev]').addEventListener('click', () => show(current - 1, true));
  root.querySelector('[data-showcase-next]').addEventListener('click', () => show(current + 1, true));
  dots.forEach(dot => dot.addEventListener('click', () => {
    const index = Number(dot.dataset.showcaseDot);
    if (Number.isInteger(index) && index >= 0 && index < slides.length) show(index, true);
  }));
  pause.addEventListener('click', () => { paused = !paused; label(); });
  root.addEventListener('pointerenter', () => { hovered = true; });
  root.addEventListener('pointerleave', () => { hovered = false; });
  root.addEventListener('focusin', () => { paused = true; label(); });
  root.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1), true);
  });
  motion.addEventListener('change', event => { if (event.matches) { paused = true; label(); } });
  let startX = null;
  let startY = null;
  root.querySelector('.showcase-stage').addEventListener('touchstart', event => {
    if (event.touches.length !== 1) return;
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }, { passive: true });
  root.querySelector('.showcase-stage').addEventListener('touchend', event => {
    if (startX === null || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - startX;
    const dy = event.changedTouches[0].clientY - startY;
    startX = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(current + (dx < 0 ? 1 : -1), true);
  }, { passive: true });
  window.setInterval(() => {
    if (!paused && !hovered && !document.hidden && !root.contains(document.activeElement)) show(current + 1);
  }, 6000);
  root.querySelector('.showcase-controls').hidden = false;
  label();
  show(0);
})();
