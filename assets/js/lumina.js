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

    // ---------- Recorrido por áreas: un clip por área, avanza solo al terminar ----------
    const clip = document.getElementById('luClip');
    const tabs = [...document.querySelectorAll('.lu-tab')];
    if (!clip || !tabs.length) return;
    const $ = (id) => document.getElementById(id);
    const texto = document.querySelector('.lu-tour-text');
    let actual = -1, visible = false, pausadoPorUsuario = false;

    const elegir = (i, reproducir) => {
        if (i === actual) return;
        actual = i;
        const t = tabs[i], d = t.dataset;
        tabs.forEach((b, j) => { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; b.style.setProperty('--avance', 0); });
        clip.poster = `assets/img/lumina/v31/${d.clip}.jpg`;
        clip.src = `assets/videos/lumina/v31/${d.clip}.mp4`;
        clip.setAttribute('aria-label', `Demo en video: ${d.titulo}`);
        // El texto cambia con un fundido corto para no saltar de golpe
        texto.classList.add('cambiando');
        setTimeout(() => {
            $('luRuta').textContent = d.ruta;
            $('luTitulo').textContent = d.titulo;
            $('luTexto').textContent = d.texto;
            $('luChips').innerHTML = d.chips.split('|').map((c) => `<span>${c}</span>`).join('');
            texto.classList.remove('cambiando');
        }, reduce ? 0 : 180);
        if (reproducir && visible && !reduce) clip.play().catch(() => {});
    };

    tabs.forEach((t, i) => {
        t.addEventListener('click', () => { pausadoPorUsuario = false; elegir(i, true); clip.play().catch(() => {}); });
        // Flechas para moverse entre pestañas (patrón de tablist)
        t.addEventListener('keydown', (e) => {
            const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
            e.preventDefault(); const n = (i + k + tabs.length) % tabs.length; tabs[n].focus(); elegir(n, true);
        });
    });
    clip.addEventListener('timeupdate', () => {
        if (clip.duration) tabs[actual].style.setProperty('--avance', (clip.currentTime / clip.duration).toFixed(3));
    });
    clip.addEventListener('ended', () => elegir((actual + 1) % tabs.length, true));
    clip.addEventListener('pause', () => { if (!clip.ended && visible) pausadoPorUsuario = true; });
    clip.addEventListener('play', () => { pausadoPorUsuario = false; });

    // Solo se descarga y reproduce cuando el recorrido está a la vista (ahorra datos)
    new IntersectionObserver((es) => es.forEach((e) => {
        visible = e.isIntersecting;
        if (visible) { if (actual < 0) elegir(0, false); if (!reduce && !pausadoPorUsuario) clip.play().catch(() => {}); }
        else if (!clip.paused) { clip.pause(); pausadoPorUsuario = false; }
    }), { threshold: 0.35 }).observe(clip);

    // Botón de pausa accesible, igual que los demás videos del sitio
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'vid-toggle';
    const pintar = () => { const on = !clip.paused; btn.setAttribute('aria-label', (on ? 'Pausar' : 'Reproducir') + ' el recorrido de Lumina'); btn.innerHTML = on ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'; };
    clip.addEventListener('play', pintar); clip.addEventListener('pause', pintar); pintar();
    btn.addEventListener('click', () => { if (clip.paused) clip.play().catch(() => {}); else clip.pause(); });
    clip.parentElement.appendChild(btn);
    if (actual < 0) elegir(0, false);
})();
