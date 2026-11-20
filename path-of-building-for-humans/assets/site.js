// Path of Building for Humans · project page: language, screenshots and gentle reveals.
// No cookies and no requests to other sites; the chosen language stays in this browser only.
(() => {
  const root = document.documentElement;
  const STORAGE = "pobh-site-lang";

  const read = () => {
    try { return localStorage.getItem(STORAGE); } catch { return null; }
  };
  const write = (value) => {
    try { localStorage.setItem(STORAGE, value); } catch { /* storage blocked: the choice lasts this visit only */ }
  };

  // ?lang=en in a shared link wins, then the visitor's own choice, then their browser's language.
  const fromLink = new URLSearchParams(location.search).get("lang");
  const initial =
    fromLink === "en" || fromLink === "es" ? fromLink :
    read() || ((navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en");

  const titles = { es: root.dataset.titleEs, en: root.dataset.titleEn };
  const descriptions = { es: root.dataset.descEs, en: root.dataset.descEn };

  function setLanguage(lang, remember) {
    root.dataset.lang = lang;
    root.lang = lang;
    if (titles[lang]) document.title = titles[lang];
    const meta = document.querySelector('meta[name="description"]');
    if (meta && descriptions[lang]) meta.setAttribute("content", descriptions[lang]);
    document.querySelectorAll(".lang button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });
    if (remember) write(lang);
  }

  setLanguage(initial, false);
  document.querySelectorAll(".lang button").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang, true));
  });

  // Screenshots open full size.
  const dialog = document.querySelector(".lightbox");
  if (dialog && typeof dialog.showModal === "function") {
    const image = dialog.querySelector("img");
    const caption = dialog.querySelector(".lightbox__caption");
    document.querySelectorAll("button.shot").forEach((shot) => {
      shot.addEventListener("click", () => {
        const source = shot.querySelector("img");
        image.src = source.currentSrc || source.src;
        image.alt = source.alt;
        caption.textContent = source.alt;
        dialog.showModal();
      });
    });
    dialog.querySelector(".lightbox__close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  }

  // Sections rise in as they come into view.
  const rising = document.querySelectorAll(".rise");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("is-pending");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    // Only what is still below the fold waits; with no script nothing is ever hidden.
    rising.forEach((element) => {
      if (element.getBoundingClientRect().top > innerHeight) element.classList.add("is-pending");
      observer.observe(element);
    });
  }

  document.querySelectorAll("[data-year]").forEach((element) => { element.textContent = String(new Date().getFullYear()); });
})();
