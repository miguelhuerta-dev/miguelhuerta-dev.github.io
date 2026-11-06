// Navegación por sección, apariciones, Hito, Mentoring, videos y modal

// =====================================================================
//  Rediseño 2026 · navegación por sección, Hito, Mentoring y proyectos
// =====================================================================
(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Lumina: el trazo del electrocardiograma se dibuja una vez al llegar ----------
    const luStage = document.getElementById('luStage');
    if (luStage) new IntersectionObserver((es, o) => es.forEach((e) => {
        if (e.isIntersecting) { luStage.classList.add('in'); o.disconnect(); }
    }), { threshold: 0.3 }).observe(luStage);

    // ---------- Navegación: sección activa con su color ----------
    const nav = document.getElementById('nv');
    const ind = nav.querySelector('.nv-ind');
    const chapter = document.getElementById('nvChapter');
    const links = [...nav.querySelectorAll('.nv-links a')];
    const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const ul = nav.querySelector('.nv-links');
    let lastId = undefined;
    const setActive = (sec) => {
        const id = sec ? '#' + sec.id : null;
        if (id === lastId) return;
        lastId = id;
        links.forEach((a) => {
            const on = a.getAttribute('href') === id;
            a.classList.toggle('on', on);
            if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
        const on = links.find((a) => a.getAttribute('href') === id);
        // Cada sección pinta el indicador con su color de categoría (como en Hito)
        const accent = sec?.dataset.accent || '#222222';
        nav.style.setProperty('--nv-accent', accent);
        nav.style.setProperty('--nv-on-ink', accent === '#222222' ? '#ffffff' : '#222222');
        chapter.textContent = sec ? sec.dataset.nav : '';
        if (on) {
            ind.style.opacity = '1';
            ind.style.left = on.offsetLeft + 'px';
            ind.style.width = on.offsetWidth + 'px';
            if (ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: on.offsetLeft - (ul.clientWidth - on.offsetWidth) / 2, behavior: 'smooth' });
        } else {
            ind.style.opacity = '0';
        }
    };
    const pickSection = () => {
        const y = innerHeight * 0.4;
        let cur = null;
        sections.forEach((s) => { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) cur = s; });
        return cur;
    };

    // ---------- Hito: título letra por letra ----------
    const title = document.getElementById('hxTitle');
    title.innerHTML = [...title.textContent].map((c, i) => `<span aria-hidden="true" style="--i:${i}">${c}</span>`).join('');
    new IntersectionObserver((es, o) => es.forEach((e) => {
        if (e.isIntersecting) { title.classList.add('in'); o.disconnect(); }
    }), { threshold: 0.4 }).observe(title);

    // ---------- Maqueta viva ----------
    const stage = document.getElementById('hmStage');
    const app = document.getElementById('hmApp');
    const fit = () => stage.style.setProperty('--s', Math.min(1, stage.clientWidth / 1120));
    fit(); addEventListener('resize', fit);

    const heat = document.getElementById('hmHeat');
    let cells = '';
    for (let i = 0; i < 84; i++) {
        const col = Math.floor(i / 7), row = i % 7;
        const scheduled = (row === 0 || row === 3) || (col > 7 && row !== 6);
        const r = (i * 37 + 11) % 10;
        const k = !scheduled ? '' : (col >= 10 || r >= 3) ? 'k2' : 'k1';
        cells += `<i class="${k}" style="--i:${i}"></i>`;
    }
    heat.innerHTML = cells;

    const doneEl = document.getElementById('hmDone');
    const doneWord = document.getElementById('hmDoneWord');
    const tiles = [...app.querySelectorAll('.hm-tile')];
    const countUp = (el, to, suffix = '', ms = 1200) => {
        const t0 = performance.now();
        const step = (t) => { const k = Math.min(1, (t - t0) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suffix; if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
    };
    let clockSecs = 12 * 60 + 3, clockTimer = 0, mockStarted = false;
    const clock = document.getElementById('hmClock');
    const pad = (n) => String(n).padStart(2, '0');
    const runClock = (on) => {
        clearInterval(clockTimer);
        if (on && !reduce) clockTimer = setInterval(() => { clockSecs++; clock.textContent = `00:${pad(Math.floor(clockSecs / 60))}:${pad(clockSecs % 60)}`; }, 1000);
    };
    new IntersectionObserver((es) => es.forEach((e) => {
        runClock(e.isIntersecting);
        if (!e.isIntersecting || mockStarted) return;
        mockStarted = true;
        stage.classList.add('in'); app.classList.add('in');
        countUp(document.getElementById('hmStreak'), 7);
        countUp(document.getElementById('hmPct'), 90, '%');
        // Palomea las actividades una por una, como en la app
        [0, 1, 2].forEach((t, n) => setTimeout(() => {
            tiles[t].classList.add('done');
            doneEl.textContent = n + 1;
            doneWord.textContent = n === 0 ? 'completada' : 'completadas';
        }, reduce ? 0 : 1500 + n * 900));
    }), { threshold: 0.3 }).observe(stage);

    // ---------- Videos: cargan y se reproducen solo al estar en pantalla ----------
    // Cada demo lleva un botón para pausarla; si la persona la pausa, ya no vuelve a arrancar sola.
    const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
    const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
    const paint = (btn, playing) => {
        btn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
        btn.setAttribute('aria-label', (playing ? 'Pausar video' : 'Reproducir video') + (btn.dataset.name ? ': ' + btn.dataset.name : ''));
    };
    const vObs = new IntersectionObserver((es) => es.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
            if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
            // Con movimiento reducido el video se queda en su póster
            if (!reduce && !v.dataset.userPaused) { v.muted = true; v.play().catch(() => {}); }
        } else if (!v.paused) v.pause();
    }), { threshold: 0.25, rootMargin: '200px 0px' });
    document.querySelectorAll('video[data-src]').forEach((v) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'vid-toggle';
        // El nombre dice qué video controla: "Pausar video: Tu día de un vistazo."
        btn.dataset.name = (v.getAttribute('aria-label') || '').replace('Demo en video: ', '');
        paint(btn, !reduce);
        v.parentElement.appendChild(btn);
        v.addEventListener('play', () => paint(btn, true));
        v.addEventListener('pause', () => paint(btn, false));
        btn.addEventListener('click', () => {
            if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
            if (v.paused) { delete v.dataset.userPaused; v.muted = true; v.play().catch(() => {}); }
            else { v.dataset.userPaused = '1'; v.pause(); }
        });
        vObs.observe(v);
    });

    // ---------- Navegación: marca la sección visible ----------
    // Hito se muestra siempre en su lienzo gris de galería
    document.getElementById('hito').style.setProperty('--hp', 1);
    let ticking = false;
    const update = () => { ticking = false; setActive(pickSection()); };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update();

    // ---------- Modal de video compartido ----------
    const vm = document.getElementById('vm');
    const vmVideo = document.getElementById('vmVideo');
    let lastFocus = null;
    // Mientras el modal está abierto, el resto de la página queda inerte: el foco no puede salir
    const background = [...document.body.children].filter((el) => el !== vm && el.tagName !== 'SCRIPT');
    const setInert = (on) => background.forEach((el) => { el.inert = on; });
    // Si el foco intenta salir del diálogo (por ejemplo, a la barra del navegador), vuelve a "Cerrar"
    vm.addEventListener('focusout', () => requestAnimationFrame(() => {
        if (vm.classList.contains('open') && !vm.contains(document.activeElement)) document.getElementById('vmClose').focus();
    }));
    const closeVm = () => { vm.classList.remove('open'); vm.setAttribute('aria-hidden', 'true'); setInert(false); vmVideo.pause(); lastFocus?.focus(); };
    document.querySelectorAll('[data-video]').forEach((b) => b.addEventListener('click', () => {
        lastFocus = b;
        if (vmVideo.getAttribute('src') !== b.dataset.video) { vmVideo.src = b.dataset.video; vmVideo.poster = b.dataset.poster || ''; }
        vm.classList.add('open'); vm.setAttribute('aria-hidden', 'false'); setInert(true);
        vmVideo.currentTime = 0; vmVideo.play().catch(() => {});
        document.getElementById('vmClose').focus();
    }));
    document.getElementById('vmClose').addEventListener('click', closeVm);
    vm.addEventListener('click', (e) => { if (e.target === vm) closeVm(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && vm.classList.contains('open')) closeVm(); });
})();
