// Lumina: paralaje suave de la ventana y las tarjetas flotantes con el cursor (#luStage)
(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
