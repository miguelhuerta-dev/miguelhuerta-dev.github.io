// Portafolio web: galería de funciones por sitio y menú en celular

// ===== CASOS: GALERÍA DE FUNCIONES =====
document.querySelectorAll('.case').forEach(cs => {
    const imgs = [...cs.querySelectorAll('.case-shots img')];
    const items = [...cs.querySelectorAll('.case-features li[data-i]')];
    const bar = cs.querySelector('.case-progress i');
    let cur = 0, timer = null, visible = false, hold = false;

    const show = (i) => {
        cur = (i + imgs.length) % imgs.length;
        imgs.forEach((im, k) => im.classList.toggle('on', k === cur));
        items.forEach(li => li.classList.toggle('on', +li.dataset.i === cur));
        bar.classList.remove('run'); void bar.offsetWidth;
        if (visible && !hold) bar.classList.add('run');
    };
    const tick = () => { if (visible && !hold) show(cur + 1); };
    const start = () => { clearInterval(timer); timer = setInterval(tick, 4000); show(cur); };

    items.forEach(li => {
        li.addEventListener('click', () => { hold = true; clearInterval(timer); show(+li.dataset.i); });
        li.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) { hold = true; clearInterval(timer); show(+li.dataset.i); } });
    });
    cs.querySelector('.case-features').addEventListener('mouseleave', () => { if (hold) { hold = false; start(); } });

    new IntersectionObserver(es => es.forEach(e => {
        visible = e.isIntersecting;
        if (visible) start(); else { clearInterval(timer); bar.classList.remove('run'); }
    }), { threshold: 0.3 }).observe(cs);
});

// ===== Menú en celular =====
// En celular, deja visible la pestaña activa dentro del menú deslizable
(() => { const a = document.querySelector('.nv-links a.active'); const ul = a && a.closest('.nv-links');
  if (ul && ul.scrollWidth > ul.clientWidth) ul.scrollLeft = a.offsetLeft - (ul.clientWidth - a.offsetWidth) / 2; })();
