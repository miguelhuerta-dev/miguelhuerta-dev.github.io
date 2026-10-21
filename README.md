# miguelhuerta-dev.github.io

Portafolio de Miguel Ángel Huerta Vázquez. Sitio estático para GitHub Pages, con el sistema visual de Hito (lienzos claros, tinta carbón y color solo en el contenido) y modo noche.

## Estructura

```
index.html              Inicio: hero, Hito, Mentoring, Stack, Proyectos, Sobre mí, Juego, Contacto
portafolio.html         Sitios web para negocios, con galería de funciones
assets/
  css/
    base.css            Tokens de color y tipografía, reset, botones, capítulos y navegación
    hero.css            Hero con la esfera de código binario
    hito.css            Sección de Hito (referencia del estilo del sitio)
    mentoring.css       Mentoring CRM
    proyectos.css       Tarjetas de proyectos por sección
    secciones.css       Modal de video, Stack, Sobre mí, Contacto y footer
    juego.css           "Lo que la peste ocultó" (banda oscura con identidad propia)
    responsive.css      Tablet, celular, pantallas táctiles y movimiento reducido
    noche.css           Botón Día / Noche y modo noche del inicio
    portafolio.css      Estilos de portafolio.html
    noche-portafolio.css  Modo noche de portafolio.html
  js/
    tema.js             Día / Noche (se carga en el <head> para evitar destellos)
    hero-binario.js     Animación de la esfera binaria en canvas
    escritura.js        Frase que se escribe sola en el hero
    main.js             Navegación por sección, apariciones, Hito, Mentoring, videos y modal
    juego.js            Pestañas, expediente y brasas del videojuego
    portafolio.js       Galería de funciones de portafolio.html
  img/, videos/         Capturas y demos de cada proyecto
```

## Colores

- Día: secciones alternan `#eeeeee` (el tono de Hito) y `#e3e3e3`.
- Noche (opcional, con el botón): secciones alternan `#111111` y `#171717`. La vista base siempre es la de día.
- Colores de categoría (los de Hito): `#7FB3F5`, `#C9A7F5`, `#F28B6E`, `#8FD19E`, `#E3E07A`, `#F4B740`, `#F5A3C7`.

Designed by Miguel Huerta · [@miguelhuerta-dev](https://github.com/miguelhuerta-dev)
