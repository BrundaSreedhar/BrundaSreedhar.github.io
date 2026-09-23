(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const moving = () => !reduceMotion.matches;

  /* ---------- Weekend plans: edit freely ---------- */
  const plans = {
    morning: [
      'Trailhead at sunrise. Switchbacks before small talk.',
      'Early train to a town I’ve only ever seen on a map.',
      'A slow breakfast at a café I haven’t tried yet.',
      'A loop trail with a lake at the top and snacks in every pocket.',
    ],
    midday: [
      'Coffee at the bottom of the hill, judged entirely on the foam.',
      'A market run for whatever looks unfamiliar.',
      'Hunting down the café a stranger recommended.',
      'Lunch I will absolutely try to recreate at home.',
    ],
    evening: [
      'Belly dance practice until the coin scarf gets a noise complaint.',
      'Cooking last trip’s favorite dish, with notes for next time.',
      'Planning the next trip across nine open tabs.',
      'A new recipe, a drum-heavy playlist, and flour everywhere.',
    ],
  };

  /* ---------- Theme toggle (Day roast / Night roast) ---------- */
  const root = document.documentElement;
  const themeBtn = $('#theme-toggle');
  const themeLabel = $('#theme-label');
  const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
  const effectiveTheme = () => root.getAttribute('data-theme') || (darkMq.matches ? 'dark' : 'light');

  function syncThemeLabel() {
    if (!themeBtn || !themeLabel) return;
    const next = effectiveTheme() === 'dark' ? 'Day roast' : 'Night roast';
    themeLabel.textContent = next;
    themeBtn.setAttribute('aria-label', `Switch to ${next === 'Day roast' ? 'light' : 'dark'} theme`);
  }

  themeBtn?.addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('bs-theme', next); } catch (e) { /* storage unavailable */ }
    syncThemeLabel();
  });
  darkMq.addEventListener?.('change', syncThemeLabel);
  new MutationObserver(syncThemeLabel).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  syncThemeLabel();

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  const toastKicker = $('#toast-kicker');
  const toastTitle = $('#toast-title');
  let toastTimer;

  function showToast(kicker, title) {
    if (!toast) return;
    toastKicker.textContent = kicker;
    toastTitle.textContent = title;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  /* ---------- Sticker board: drag, shuffle, tidy ---------- */
  const board = $('#board');
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  if (board) {
    const stickers = $$('.sticker', board);
    const home = stickers.map((st) => ({
      x: st.style.getPropertyValue('--x'),
      y: st.style.getPropertyValue('--y'),
      r: st.style.getPropertyValue('--r'),
    }));
    let z = 20;

    stickers.forEach((st) => {
      st.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const b = board.getBoundingClientRect();
        const s = st.getBoundingClientRect();
        const offX = e.clientX - (s.left + s.width / 2);
        const offY = e.clientY - (s.top + s.height / 2);
        st.style.zIndex = String(++z);
        st.classList.add('is-dragging');
        try { st.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }

        const move = (ev) => {
          const x = clamp(((ev.clientX - offX - b.left) / b.width) * 100, 4, 96);
          const y = clamp(((ev.clientY - offY - b.top) / b.height) * 100, 4, 96);
          st.style.setProperty('--x', `${x.toFixed(2)}%`);
          st.style.setProperty('--y', `${y.toFixed(2)}%`);
        };
        const end = () => {
          st.classList.remove('is-dragging');
          st.removeEventListener('pointermove', move);
          st.removeEventListener('pointerup', end);
          st.removeEventListener('pointercancel', end);
        };
        st.addEventListener('pointermove', move);
        st.addEventListener('pointerup', end);
        st.addEventListener('pointercancel', end);
      });
    });

    const shuffleBtn = $('#shuffle');
    let messy = false;
    shuffleBtn?.addEventListener('click', () => {
      board.classList.add('is-shuffling');
      stickers.forEach((st, i) => {
        if (messy) {
          st.style.setProperty('--x', home[i].x);
          st.style.setProperty('--y', home[i].y);
          st.style.setProperty('--r', home[i].r);
        } else {
          st.style.setProperty('--x', `${(14 + Math.random() * 72).toFixed(1)}%`);
          st.style.setProperty('--y', `${(12 + Math.random() * 76).toFixed(1)}%`);
          st.style.setProperty('--r', `${(Math.random() * 34 - 17).toFixed(1)}deg`);
        }
      });
      messy = !messy;
      shuffleBtn.textContent = messy ? 'Tidy up' : 'Shuffle';
      setTimeout(() => board.classList.remove('is-shuffling'), 700);
    });

    board.addEventListener('animationend', (e) => {
      if (e.target === board) board.classList.remove('is-shimmying');
    });
  }

  /* ---------- Coin fringe ---------- */
  const coinsEl = $('#coins');

  function buildCoins() {
    if (!coinsEl) return;
    const n = Math.max(12, Math.floor(coinsEl.clientWidth / 21));
    if (coinsEl.childElementCount === n) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const c = document.createElement('span');
      c.className = 'coin';
      c.style.setProperty('--len', `${i % 2 ? 20 : 6}px`);
      frag.appendChild(c);
    }
    coinsEl.replaceChildren(frag);
  }

  function swing(coin, delay = 0, amp = 14 + Math.random() * 16) {
    if (!moving()) return;
    coin.classList.remove('swing');
    void coin.offsetWidth; // restart the animation
    coin.style.setProperty('--delay', `${Math.round(delay)}ms`);
    coin.style.setProperty('--amp', `${(Math.random() < 0.5 ? -1 : 1) * amp}deg`);
    coin.classList.add('swing');
  }

  if (coinsEl) {
    buildCoins();
    coinsEl.addEventListener('pointerover', (e) => {
      const coin = e.target.closest('.coin');
      if (coin) swing(coin);
    });
    coinsEl.addEventListener('animationend', (e) => e.target.classList.remove('swing'));
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildCoins, 150);
    });
  }

  /* A little jingle, synthesized on the spot. Only ever plays after a click. */
  let audioCtx;
  function jingle() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const start = audioCtx.currentTime + 0.02;
      for (let i = 0; i < 16; i++) {
        const t = start + i * 0.032 + Math.random() * 0.02;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2200 + Math.random() * 2600, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.05, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      }
    } catch (e) { /* no audio, no problem */ }
  }

  $('#shimmy')?.addEventListener('click', () => {
    jingle();
    if (coinsEl) {
      $$('.coin', coinsEl).forEach((c, i) => swing(c, (i % 9) * 18 + Math.random() * 60, 22 + Math.random() * 10));
    }
    if (board && moving()) {
      board.classList.remove('is-shimmying');
      void board.offsetWidth;
      board.classList.add('is-shimmying');
    }
  });

  /* ---------- Achievements ---------- */
  $$('.badge[data-title]').forEach((badge) => {
    badge.addEventListener('click', () => {
      showToast('Achievement unlocked', badge.dataset.title);
      badge.classList.remove('is-popped');
      void badge.offsetWidth;
      badge.classList.add('is-popped');
    });
  });

  /* ---------- Weekend planner ---------- */
  const itinerary = $('#itinerary');
  const slots = ['morning', 'midday', 'evening'];
  let current = [0, 0, 0];

  $('#replan')?.addEventListener('click', () => {
    if (!itinerary) return;
    current = current.map((idx, k) => {
      const options = plans[slots[k]];
      let next = idx;
      while (next === idx && options.length > 1) next = Math.floor(Math.random() * options.length);
      return next;
    });
    $$('.plan-text', itinerary).forEach((el, k) => { el.textContent = plans[slots[k]][current[k]]; });
    itinerary.classList.remove('is-new');
    void itinerary.offsetWidth;
    itinerary.classList.add('is-new');
  });

  /* ---------- Copy email ---------- */
  $('#copy-email')?.addEventListener('click', async () => {
    const email = 'brundasreedhar@gmail.com';
    let ok = false;
    try {
      await navigator.clipboard.writeText(email);
      ok = true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        ta.remove();
      } catch (e2) { ok = false; }
    }
    showToast(ok ? 'Copied' : 'Copy blocked here', ok ? 'Email copied. Talk soon!' : email);
  });

  /* ---------- Nav: highlight the section in view ---------- */
  const navLinks = new Map($$('.nav a').map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.removeAttribute('aria-current'));
        navLinks.get(entry.target.id)?.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    navLinks.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) io.observe(section);
    });
  }

  /* ---------- Dates ---------- */
  const now = new Date();
  const year = $('#year');
  if (year) year.textContent = String(now.getFullYear());
  const pmDate = $('#pm-date');
  if (pmDate) pmDate.textContent = `${now.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${now.getFullYear()}`;
})();
