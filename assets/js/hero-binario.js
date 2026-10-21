// Hero: esfera de código binario animada en canvas

// =====================================================================
//  Hero · esfera de código binario (inspirada en Midjourney, en gris)
//  Cada celda es un 0 o un 1. Dentro de la esfera los dígitos giran,
//  se iluminan según la luz (que sigue al cursor) y "se regeneran".
// =====================================================================
(() => {
    const cv = document.getElementById('binCanvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const hero = cv.parentElement;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let INK = '70,70,70';
    const readInk = () => { INK = document.documentElement.dataset.theme === 'dark' ? '205,205,205' : '70,70,70'; };
    readInk();
    const COLORS = ['#F28B6E', '#C9A7F5', '#7FB3F5', '#8FD19E', '#F5A3C7', '#F4B740'];
    let W = 0, H = 0, dpr = 1, cw = 9, ch = 15, cols = 0, rows = 0, R = 0, cx = 0, cy = 0;
    let bg = null, running = false, raf = 0, last = 0;
    let lx = -0.45, ly = -0.55, tx = lx, ty = ly;
    // Zonas donde hay texto o botones: ahí no se dibujan dígitos
    let holes = [];
    const PAD = 10;
    const measureHoles = () => {
        const hb = hero.getBoundingClientRect();
        holes = [...hero.querySelectorAll('.hero-inner > *, .hero-actions > *, .hero-chips > *, .hero-scroll')]
            .map((el) => el.getBoundingClientRect())
            .filter((r) => r.width > 0 && r.height > 0)
            .map((r) => ({ x0: r.left - hb.left - PAD, y0: r.top - hb.top - PAD, x1: r.right - hb.left + PAD, y1: r.bottom - hb.top + PAD }));
    };
    // Para títulos de varias líneas se mide cada línea de texto, no la caja completa
    const measureLines = () => {
        const hb = hero.getBoundingClientRect();
        const out = [];
        hero.querySelectorAll('.hero-eyebrow, .hero-title, .hero-type, .hero-sub').forEach((el) => {
            const rg = document.createRange(); rg.selectNodeContents(el);
            [...rg.getClientRects()].forEach((r) => { if (r.width > 0) out.push({ x0: r.left - hb.left - PAD, y0: r.top - hb.top - PAD / 2, x1: r.right - hb.left + PAD, y1: r.bottom - hb.top + PAD / 2 }); });
        });
        hero.querySelectorAll('.hero-actions > *, .hero-chips > *, .hero-scroll').forEach((el) => {
            const r = el.getBoundingClientRect();
            out.push({ x0: r.left - hb.left - PAD, y0: r.top - hb.top - PAD, x1: r.right - hb.left + PAD, y1: r.bottom - hb.top + PAD });
        });
        holes = out.length ? out : holes;
    };
    const inHole = (x, y) => {
        for (let i = 0; i < holes.length; i++) { const h = holes[i]; if (x > h.x0 && x < h.x1 && y > h.y0 && y < h.y1) return true; }
        return false;
    };

    // Hash entero determinista: el mismo "texto" vuelve a aparecer al girar
    const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return (h ^ (h >>> 16)) >>> 0; };

    const resize = () => {
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = hero.clientWidth; H = hero.clientHeight;
        cv.width = W * dpr; cv.height = H * dpr;
        const small = W < 600;
        cw = small ? 8 : 9; ch = small ? 13 : 15;
        cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
        R = Math.min(W * (small ? 0.62 : 0.4), H * 0.4);
        cx = W / 2; cy = H * 0.5;
        measureHoles(); measureLines();
        // Capa de fondo: dígitos muy tenues por toda la pantalla (se dibuja una vez)
        bg = document.createElement('canvas');
        bg.width = cv.width; bg.height = cv.height;
        const b = bg.getContext('2d');
        b.scale(dpr, dpr);
        b.font = `${small ? 10 : 11}px 'JetBrains Mono', ui-monospace, monospace`;
        b.textBaseline = 'top';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const h = hash(c, r);
                if (h % 7 === 0) continue;
                b.fillStyle = `rgba(${INK},${0.035 + (h % 5) * 0.008})`;
                b.fillText(h & 1 ? '1' : '0', c * cw, r * ch);
            }
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = `${small ? 10 : 11}px 'JetBrains Mono', ui-monospace, monospace`;
        ctx.textBaseline = 'top';
    };

    const draw = (t) => {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(bg, 0, 0, W, H);
        for (const h of holes) ctx.clearRect(h.x0, h.y0, h.x1 - h.x0, h.y1 - h.y0);
        lx += (tx - lx) * 0.05; ly += (ty - ly) * 0.05;
        const lz = Math.sqrt(Math.max(0, 1 - lx * lx - ly * ly));
        const spin = t * 0.00018;               // giro de la esfera
        const scan = (t * 0.00025) % 2.4 - 1.2;  // banda que "genera" de arriba a abajo
        const tick = Math.floor(t / 140);        // cada cuánto parpadean dígitos
        const r0 = Math.max(0, Math.floor((cy - R) / ch)), r1 = Math.min(rows, Math.ceil((cy + R) / ch));
        const c0 = Math.max(0, Math.floor((cx - R * 1.08) / cw)), c1 = Math.min(cols, Math.ceil((cx + R * 1.08) / cw));
        for (let r = r0; r < r1; r++) {
            const y = (r * ch + ch / 2 - cy) / R;
            for (let c = c0; c < c1; c++) {
                const x = (c * cw + cw / 2 - cx) / (R * 1.08);
                const d2 = x * x + y * y;
                if (d2 >= 1) continue;
                if (inHole(c * cw + cw / 2, r * ch + ch / 2)) continue;
                const z = Math.sqrt(1 - d2);
                // Coordenadas sobre la esfera: longitud gira con el tiempo
                const lon = Math.atan2(x, z) + spin;
                const lat = Math.asin(y);
                const li = Math.floor((lat + 1.6) * 9);          // renglones de "texto"
                const lo = Math.floor((lon + 50) * 14);          // columnas que giran
                const h = hash(lo, li);
                // Huecos entre "palabras", como texto que envuelve la esfera
                if (h % 11 === 0) continue;
                const light = Math.max(0, x * lx + y * ly + z * lz);
                const rim = Math.pow(1 - z, 3) * 0.35;
                const band = Math.max(0, 1 - Math.abs(y - scan) * 4) * 0.35;
                let a = 0.06 + light * 0.32 + rim + band;
                if (a > 0.46) a = 0.46;
                const flick = hash(h, tick + (h % 9)) % 23 === 0;
                const bit = (flick ? h >> 3 : h) & 1 ? '1' : '0';
                if (h % 97 === 0 && light > 0.35) {
                    ctx.fillStyle = COLORS[h % COLORS.length];
                } else {
                    ctx.fillStyle = `rgba(${INK},${a.toFixed(3)})`;
                }
                ctx.fillText(bit, c * cw, r * ch);
            }
        }
    };

    let lastMeasure = 0;
    const loop = (t) => {
        if (!running) return;
        if (t - lastMeasure > 600) { measureLines(); lastMeasure = t; }
        if (t - last > 33) { draw(t); last = t; }   // ~30 cuadros por segundo
        raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduce) { draw(0); }
    else {
        new IntersectionObserver((es) => es.forEach((e) => {
            running = e.isIntersecting;
            cancelAnimationFrame(raf);
            if (running) raf = requestAnimationFrame(loop);
        })).observe(hero);
        hero.addEventListener('pointermove', (e) => {
            const b = hero.getBoundingClientRect();
            tx = ((e.clientX - b.left) / b.width - 0.5) * -1.2;
            ty = ((e.clientY - b.top) / b.height - 0.5) * -1.2;
        });
        hero.addEventListener('pointerleave', () => { tx = -0.45; ty = -0.55; });
    }
    // Al cambiar entre día y noche se vuelve a pintar con el color correcto
    document.addEventListener('temachange', () => { readInk(); resize(); draw(performance.now()); });
    let rt = 0;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduce) draw(0); }, 150); });
    // Redibuja cuando cargue la fuente monoespaciada
    if (document.fonts) document.fonts.ready.then(() => { resize(); if (reduce) draw(0); });
})();
