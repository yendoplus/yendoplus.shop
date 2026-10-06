(function () {
  const THEME_KEY = 'yendo_theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  });
})();

/* ===== Estela de emojis (mouse) + explosion al hacer click/tocar ===== */
(function () {
  // Edita aqui los emojis que quieras usar
  const TRAIL_EMOJIS = ['⭐', '✨', '⚡', '🌟'];
  const MAX_ACTIVE = 45;      // tope de emojis en pantalla a la vez (cuida el rendimiento)
  const MIN_DIST = 22;        // px que debe moverse el mouse para soltar otro emoji
  const MIN_GAP_MS = 35;      // tiempo minimo entre emojis

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let active = 0, lastX = -999, lastY = -999, lastT = 0;
  const pick = () => TRAIL_EMOJIS[Math.floor(Math.random() * TRAIL_EMOJIS.length)];

  function spawn(x, y, dx, dy, size, dur) {
    if (active >= MAX_ACTIVE || !document.body) return;
    const el = document.createElement('span');
    el.textContent = pick();
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;font-size:' + size +
      'px;line-height:1;pointer-events:none;user-select:none;z-index:99999;will-change:transform,opacity;';
    document.body.appendChild(el);
    active++;
    const rot = (Math.random() * 120 - 60);
    const anim = el.animate([
      { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
      { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.3) rotate(' + rot + 'deg)', opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(.2,.7,.4,1)' });
    const done = () => { el.remove(); active--; };
    anim.onfinish = done;
    anim.oncancel = done;
  }

  // Estela: solo con mouse (en celular no hay cursor que seguir)
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    const now = performance.now();
    if (now - lastT < MIN_GAP_MS) return;
    if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < MIN_DIST) return;
    lastX = e.clientX; lastY = e.clientY; lastT = now;
    spawn(e.clientX, e.clientY, Math.random() * 30 - 15, 25 + Math.random() * 25, 14 + Math.random() * 8, 650);
  }, { passive: true });

  // Click / toque: pequena explosion de emojis
  document.addEventListener('pointerdown', function (e) {
    const n = 8;
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const dist = 45 + Math.random() * 30;
      spawn(e.clientX, e.clientY, Math.cos(ang) * dist, Math.sin(ang) * dist, 16 + Math.random() * 8, 700);
    }
  }, { passive: true });
})();
