// Portafolio web: galería de funciones por sitio y menú en celular

// ===== CASOS: GALERÍA DE FUNCIONES =====
document.querySelectorAll('.case').forEach(cs => {
    const imgs = [...cs.querySelectorAll('.case-shots img')];
    const items = [...cs.querySelectorAll('.case-features li[data-i]')];
    // Sin avance automático: la captura cambia solo cuando eliges una función
    const show = (i) => {
        imgs.forEach((im, k) => im.classList.toggle('on', k === i));
        items.forEach(li => li.classList.toggle('on', +li.dataset.i === i));
    };
    items.forEach(li => {
        li.addEventListener('click', () => show(+li.dataset.i));
        li.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) show(+li.dataset.i); });
    });
});

// ===== Menú en celular =====
// En celular, deja visible la pestaña activa dentro del menú deslizable
(() => { const a = document.querySelector('.nv-links a.active'); const ul = a && a.closest('.nv-links');
  if (ul && ul.scrollWidth > ul.clientWidth) ul.scrollLeft = a.offsetLeft - (ul.clientWidth - a.offsetWidth) / 2; })();
