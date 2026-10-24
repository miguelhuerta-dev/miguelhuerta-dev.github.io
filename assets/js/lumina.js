// Lumina: animaciones propias de la sección
// - Contadores que suben al aparecer (#luStats)
// - Paralaje suave de la ventana y las tarjetas flotantes con el cursor (#luStage)
(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fmt = new Intl.NumberFormat('es-MX');

    // ---------- Contadores ----------
    const stats = document.getElementById('luStats');
    if (stats) {
        const nums = stats.querySelectorAll('b[data-count]');
        const run = () => nums.forEach((b) => {
            const end = +b.dataset.count;
            if (reduce) { b.textContent = fmt.format(end); return; }
            const t0 = performance.now(), dur = 1600;
            const step = (t) => {
                const k = Math.min(1, (t - t0) / dur);
                const e = 1 - Math.pow(1 - k, 4);
                b.textContent = fmt.format(Math.round(end * e));
                if (k < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
        nums.forEach((b) => { b.textContent = reduce ? fmt.format(+b.dataset.count) : '0'; });
        new IntersectionObserver((es, o) => es.forEach((e) => {
            if (e.isIntersecting) { run(); o.disconnect(); }
        }), { threshold: .4 }).observe(stats);
    }

    // ---------- Paralaje del escenario ----------
    const stage = document.getElementById('luStage');
    if (stage && !reduce && matchMedia('(hover: hover)').matches) {
        let raf = 0;
        stage.addEventListener('pointermove', (e) => {
            const r = stage.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width - .5) * 2;
            const y = ((e.clientY - r.top) / r.height - .5) * 2;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                stage.style.setProperty('--px', x.toFixed(3));
                stage.style.setProperty('--py', y.toFixed(3));
            });
        });
        stage.addEventListener('pointerleave', () => {
            stage.style.setProperty('--px', 0);
            stage.style.setProperty('--py', 0);
        });
    }
})();
