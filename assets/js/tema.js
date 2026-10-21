// Tema día / noche
// Se carga en el <head> (sin defer) para aplicar el tema antes de pintar la página
// y evitar el destello claro al abrirla en modo noche.
(() => {
    const KEY = 'mh-tema';
    const root = document.documentElement;

    const saved = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
    const store = (v) => { try { localStorage.setItem(KEY, v); } catch { /* sin almacenamiento: solo esta visita */ } };

    const apply = (theme) => {
        root.dataset.theme = theme;
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = theme === 'dark' ? '#171717' : '#e3e3e3';
        document.querySelectorAll('.theme-btn').forEach((b) => {
            const dark = theme === 'dark';
            b.setAttribute('aria-pressed', String(dark));
            b.setAttribute('aria-label', dark ? 'Cambiar a modo día' : 'Cambiar a modo noche');
            b.title = dark ? 'Modo día' : 'Modo noche';
        });
        document.dispatchEvent(new CustomEvent('temachange', { detail: theme }));
    };

    // La vista base es la clara (día). Solo cambia si la persona elige noche con el botón,
    // y esa elección se recuerda en sus siguientes visitas.
    apply(saved() === 'dark' ? 'dark' : 'light');

    document.addEventListener('DOMContentLoaded', () => {
        apply(root.dataset.theme);
        document.querySelectorAll('.theme-btn').forEach((b) => b.addEventListener('click', () => {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            store(next);
            root.classList.add('theme-anim');
            apply(next);
            setTimeout(() => root.classList.remove('theme-anim'), 500);
        }));
    });
})();
