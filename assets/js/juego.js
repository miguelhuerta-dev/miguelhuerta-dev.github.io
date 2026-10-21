// Juego: pestañas de la maqueta, expediente y brasas

// ===== Juego: pestañas de la maqueta, expediente y brasas =====
(() => {
    const tabs = document.querySelectorAll('.gm-tab');
    const shots = document.querySelectorAll('.gm-view img');
    const cap = document.getElementById('gmCap');
    const caps = [
        'Sigilo en tiempo real: el ruido se ve como ondas, y los Callados oyen dentro de su círculo.',
        'Encuentro por turnos: cada opción muestra su costo antes de elegir, y el tiempo corre contra la tos.'
    ];
    tabs.forEach((t) => t.addEventListener('click', () => {
        const i = +t.dataset.shot;
        tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
        shots.forEach((im, k) => im.classList.toggle('on', k === i));
        cap.textContent = caps[i];
    }));

    const more = document.getElementById('gmMore');
    const dossier = document.getElementById('gmDossier');
    more.addEventListener('click', () => {
        const open = dossier.classList.toggle('open');
        more.setAttribute('aria-expanded', String(open));
        more.firstChild.textContent = open ? 'Cerrar el expediente ' : 'Abrir el expediente ';
        if (open) setTimeout(() => dossier.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    });

    const cv = document.getElementById('gmEmbers');
    if (!cv || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, running = false, raf = 0;
    const parts = Array.from({ length: 46 }, () => ({}));
    const reset = (p, first) => {
        p.x = Math.random() * w; p.y = first ? Math.random() * h : h + 10;
        p.r = Math.random() * 1.6 + 0.4; p.vy = Math.random() * 0.35 + 0.12;
        p.vx = (Math.random() - 0.5) * 0.2; p.a = Math.random() * 0.6 + 0.2; p.t = Math.random() * 6.28;
    };
    const size = () => { w = cv.width = cv.offsetWidth; h = cv.height = cv.offsetHeight; parts.forEach((p) => reset(p, true)); };
    const tick = () => {
        ctx.clearRect(0, 0, w, h);
        parts.forEach((p) => {
            p.t += 0.02; p.y -= p.vy; p.x += p.vx + Math.sin(p.t) * 0.15;
            if (p.y < -10) reset(p, false);
            const fade = Math.min(1, p.y / (h * 0.5));
            ctx.fillStyle = `rgba(234, 108, 52, ${p.a * fade})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        });
        if (running) raf = requestAnimationFrame(tick);
    };
    size(); addEventListener('resize', size);
    new IntersectionObserver((es) => es.forEach((e) => {
        running = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (running) raf = requestAnimationFrame(tick);
    })).observe(cv);
})();
