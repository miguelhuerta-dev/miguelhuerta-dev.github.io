// Portafolio web: galería de funciones por sitio y menú en celular

// ===== CASOS: GALERÍA DE FUNCIONES =====
document.querySelectorAll('.case').forEach(cs => {
    const imgs = [...cs.querySelectorAll('.case-shots img')];
    const items = [...cs.querySelectorAll('.case-features li[data-i]')];
    // Sin avance automático: la captura cambia solo cuando eliges una función
    // La lista de funciones es un grupo de pestañas: cada una muestra su captura
    const list = cs.querySelector('.case-features');
    list.setAttribute('role', 'tablist');
    // Los renglones que no cambian la captura no son pestañas
    list.querySelectorAll(':scope > li:not([data-i])').forEach((li) => li.setAttribute('role', 'none'));
    list.setAttribute('aria-label', 'Funciones del sitio ' + (cs.querySelector('h2')?.textContent.trim() || ''));
    const show = (i) => {
        imgs.forEach((im, k) => im.classList.toggle('on', k === i));
        items.forEach(li => {
            const on = +li.dataset.i === i;
            li.classList.toggle('on', on);
            li.setAttribute('aria-selected', String(on));
            li.tabIndex = on ? 0 : -1;
        });
    };
    items.forEach((li, n) => {
        li.setAttribute('role', 'tab');
        li.setAttribute('aria-selected', String(li.classList.contains('on')));
        li.tabIndex = li.classList.contains('on') ? 0 : -1;
        // Flechas, Inicio y Fin para moverse; Enter o Espacio también seleccionan
        li.addEventListener('keydown', (e) => {
            const last = items.length - 1;
            const to = { ArrowDown: n === last ? 0 : n + 1, ArrowRight: n === last ? 0 : n + 1, ArrowUp: n === 0 ? last : n - 1, ArrowLeft: n === 0 ? last : n - 1, Home: 0, End: last, Enter: n, ' ': n }[e.key];
            if (to === undefined) return;
            e.preventDefault();
            show(+items[to].dataset.i); items[to].focus();
        });
        li.addEventListener('click', () => show(+li.dataset.i));
        li.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) show(+li.dataset.i); });
    });
});

// ===== Menú en celular =====
// En celular, deja visible la pestaña activa dentro del menú deslizable
(() => { const a = document.querySelector('.nv-links a.active'); const ul = a && a.closest('.nv-links');
  if (ul && ul.scrollWidth > ul.clientWidth) ul.scrollLeft = a.offsetLeft - (ul.clientWidth - a.offsetWidth) / 2; })();
