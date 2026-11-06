# Auditoría de accesibilidad: miguelhuerta-dev.github.io

**Perspectiva**: Ingeniero de accesibilidad
**Fecha**: 2026-11-06
**Alcance**: modo repo. Se revisaron `index.html` y `portafolio.html` tal como están en la rama, después del pulido de diseño.
**Método**: axe-core 4.10.2 (WCAG 2.0/2.1 A y AA, más buenas prácticas) en modo día y noche a 1440 px; recorrido con teclado en Chromium headless con Playwright (40 Tab, modal, pestañas); lectura de HTML, CSS y JS.

## Resumen
Es un sitio estático de portafolio con un modal de video, pestañas, un panel desplegable ("expediente"), cambio de tema y 15 videos en bucle que se reproducen solos. Funciona bien con mouse y casi todo con teclado. Los problemas de fondo son cinco: el modal no retiene el foco, el contenido oculto del expediente recibe foco, los videos se mueven sin control para pausarlos, no hay landmark `main` ni enlace para saltar al contenido, y algunos colores no alcanzan el contraste mínimo.

## Archivos revisados
| Archivo | Papel en accesibilidad | Riesgo |
|------|----------|------|
| `index.html` | Estructura, encabezados, ARIA de pestañas, expediente, modal y videos | Alto |
| `portafolio.html` | Estructura, galería de funciones, botón flotante | Medio |
| `assets/js/main.js` | Modal (foco, Escape), carga y reproducción de videos, navegación | Alto |
| `assets/js/juego.js` | Pestañas y expediente desplegable | Alto |
| `assets/js/tema.js` | Botón día/noche (`aria-pressed`, `aria-label`) | Bajo |
| `assets/js/portafolio.js` | Galería: clic y hover sobre la lista de funciones | Medio |
| `assets/css/base.css`, `lumina.css`, `hito.css`, `juego.css`, `portafolio.css`, `noche*.css` | Foco visible, contraste, movimiento reducido | Medio |

## Veredicto: APROBAR CON CAMBIOS

## Problemas críticos (corregir antes de publicar)
| # | Problema | Criterio WCAG | Archivo(s) | Impacto | Solución |
|---|-------|---------------|---------|--------|-----|
| 1 | **El modal de video no retiene el foco.** Al abrirlo, el foco va bien a "Cerrar video" y Escape lo cierra y devuelve el foco al botón que lo abrió. Pero desde el video, dos Shift+Tab sacan el foco al contenido de fondo, que sigue tabulable y visible para lectores de pantalla. | 2.4.3 Orden del foco; 1.3.2 | `main.js` (modal), `index.html` (`#vm`) | La persona queda navegando "detrás" del diálogo sin saberlo. | Usar `<dialog>` con `showModal()`, que ya hace el fondo inerte. O, al abrir, poner `inert` a `header`, `section` y `footer` y quitarlo al cerrar. |
| 2 | **El expediente cerrado se puede tabular.** `.gm-dossier` se oculta con `grid-template-rows: 0fr` y `overflow: hidden`, pero sus 11 `span.gm-redact tabindex="0"` siguen en el orden de tabulación. En el recorrido, los Tab 35 a 40 cayeron en "Información oculta" invisible. | 2.4.7 Foco visible; 2.4.3 | `index.html` (`#gmDossier`), `juego.js` | Hay paradas de foco que no se ven. El lector anuncia contenido que, a la vista, no existe. | Poner `inert` en `#gmDossier` mientras esté cerrado y quitarlo al abrir. |
| 3 | **15 videos en bucle se reproducen solos sin forma de pausarlos.** Las demos de Lumina, Hito y Mentoring arrancan al entrar en pantalla y no tienen controles. | 2.2.2 Pausar, detener, ocultar | `main.js` (observador de videos), `index.html` | Molesta o impide leer a personas con TDAH o trastornos vestibulares. Con `prefers-reduced-motion` ya se detienen, pero eso no cubre el criterio para todos. | Agregar a cada marco un botón "Pausar video"/"Reproducir video" (`aria-pressed`) o un interruptor global "Pausar animaciones". |
| 4 | **El contenido oculto usa `aria-label` en `span` sin rol** (11 casos de `.gm-redact`). | 4.1.2 Nombre, rol, valor | `index.html` | Los lectores ignoran o anuncian mal la etiqueta. Además es foco sin acción (ver #2). | `<span class="gm-redact" role="img" aria-label="Texto censurado: se revela en el juego">` sin `tabindex`. El tooltip puede quedarse solo con hover. |
| 5 | **Contraste insuficiente en texto.** <br>• `.lu-num` (etiquetas de función de Lumina): #0071e3 sobre #dde8f5 = **3.78:1** <br>• `.lu-word` "LUMINA": #0071e3 sobre #f5f5f7 = **4.31:1** <br>• Modo noche, botón "Ver demo" de Lumina: blanco sobre #0a84ff = **3.64:1** <br>• Contador del marco de Hito "01 / 05": #8a8a8a sobre #f7f7f7 = **3.22:1** <br>• `portafolio.html`, menú: #737373 sobre #f8f8f8 = **4.46:1** | 1.4.3 Contraste mínimo | `lumina.css`, `hito.css`, `portafolio.css` | El texto pequeño queda por debajo de 4.5:1. | `.lu-num` y `.lu-word` a #0058b0. Botón azul en noche a #0071e3 o texto más oscuro. Contador a #6b6b6b. Menú del portafolio con `opacity: .72` o color #5f5f5f. |

## Recomendaciones
| # | Problema | Criterio WCAG | Solución |
|---|-------|---------------|-----|
| 1 | No hay landmark `<main>` en ninguna de las dos páginas (axe: `region` 112 nodos y `landmark-one-main`). | 1.3.1; 2.4.1 | Envolver las secciones entre `header` y `footer` en `<main id="contenido">`. |
| 2 | No hay enlace para saltar al contenido. El menú tiene 10 paradas antes del primer contenido. | 2.4.1 Saltar bloques | Primer elemento del `body`: `<a class="skip" href="#contenido">Saltar al contenido</a>`, visible solo al recibir foco. |
| 3 | Pestañas del juego incompletas: no hay `role="tabpanel"`, `aria-controls` ni `aria-labelledby`. Las flechas no mueven entre pestañas y ambas pestañas reciben Tab (no se usa tabindex móvil). | 4.1.2; patrón ARIA Tabs | Envolver `.gm-view` en `role="tabpanel"` con `aria-labelledby`. Flechas Izq/Der con `tabindex="-1"` en la pestaña inactiva. O, más simple, quitar los roles y dejar dos botones con `aria-pressed`. |
| 4 | Saltos en encabezados: los `h4` de `.gm-pillar` y del footer vienen después de un `h2`, sin `h3` intermedio. | 1.3.1 | Cambiar a `h3`, o en el footer a texto que no sea encabezado. |
| 5 | 12 videos inline sin nombre accesible (Lumina e Hito; los de Mentoring ya lo tienen). | 1.1.1 | Agregar `aria-label` describiendo qué muestra, o `aria-hidden="true"` si son decorativos, con la descripción en el párrafo de abajo. |
| 6 | El botón día/noche cambia su `aria-label` **y** su `aria-pressed` a la vez. El lector dice "Cambiar a modo día, botón de alternancia, presionado", que es contradictorio. | 4.1.2 | Etiqueta fija "Modo noche" más `aria-pressed`, o etiqueta cambiante sin `aria-pressed`. Una de las dos. |
| 7 | Las tarjetas de Proyectos son `<a>` que envuelven toda la tarjeta. Su nombre accesible es todo el texto concatenado ("App de escritorio · Windows y macOSHito Último proyecto…"). | 2.4.4 Propósito del enlace | `aria-labelledby` apuntando al `h4`, o un enlace solo en el título con el resto de la tarjeta clicable por `::after`. |
| 8 | En `portafolio.html`, la galería cambia con hover y clic sobre `<li>`, que no reciben foco ni responden al teclado. | 2.1.1 Teclado | Convertir cada función en `<button>` con `aria-pressed`, o en `role="tab"` dentro de un `tablist`. |
| 9 | En celular, los enlaces del menú miden unos 30 px de alto (`padding: 7px 9px`, `.76rem`). | 2.5.8 Tamaño del objetivo (AA en 2.2) | Llevarlos a 44 px de alto con padding vertical o con un pseudo-elemento. |
| 10 | El menú de `index.html` marca la sección activa solo con color y clase, sin `aria-current`. | 1.3.1 | `aria-current="location"` en el enlace activo, desde `setActive()`. |

## Mejoras opcionales
| # | Sugerencia | Razón |
|---|------------|-----------|
| 1 | `aria-hidden="true"` en las tarjetas flotantes de Lumina (`.lu-float`: "Glucosa 98 mg/dL", etc.) y en `.hx-mosaic` | Son decoración de la maqueta. Hoy el lector las lee como si fueran contenido. |
| 2 | `scroll-margin-top: 90px` en las secciones con ancla | Evita que el menú fijo tape el inicio de la sección al saltar desde el menú o desde el enlace para saltar al contenido. |
| 3 | Atributo `translate="no"` en marcas (Lumina, Hito, SignalR, ASP.NET) | Evita traducciones automáticas raras. |
| 4 | Con `prefers-reduced-motion`, quitar `scroll-behavior: smooth` de `html` | El desplazamiento suave también cuenta como movimiento. |
| 5 | `aria-live="polite"` en `#gmCap` | El pie de la maqueta cambia al elegir una pestaña y hoy no se anuncia. |

## Recorrido con teclado (index.html)
| Paso | Acción | Foco esperado | Anuncio esperado | ¿Lo cumple? |
|------|--------|---------------|----------------------|---------------|
| 1 | Tab desde el inicio | Enlace para saltar al contenido | "Saltar al contenido, enlace" | **No**: no existe. Cae en "Miguel Huerta". |
| 2 | Tab ×7 | Enlaces del menú | "Lumina, enlace" … "Contacto, enlace" | Sí, con foco visible |
| 3 | Tab | Botón día/noche | "Modo noche, botón de alternancia, no presionado" | Parcial (ver recomendación 6) |
| 4 | Tab ×4 | Portafolio web, Ver proyectos, Contactar, GitHub | Nombres claros | Sí |
| 5 | Tab → Enter en "Ver demo · 3:51" | Se abre el modal y el foco va a "Cerrar video" | "Video, diálogo. Cerrar video, botón" | Sí |
| 6 | Tab / Shift+Tab dentro del modal | El foco se queda en el diálogo | — | **No**: dos Shift+Tab salen al fondo |
| 7 | Escape | Se cierra el modal y el foco vuelve a "Ver demo" | — | Sí |
| 8 | Tab por Hito y Mentoring | Botones de demo y "Funciones" | Nombres claros | Sí |
| 9 | Tab por Proyectos | 4 tarjetas-enlace y 4 enlaces a sitios | Nombre corto de cada proyecto | Parcial: nombres demasiado largos (recomendación 7) |
| 10 | Tab a pestañas del juego y flecha derecha | Pasa a "Encuentro por turnos" | "Encuentro por turnos, pestaña, 2 de 2" | **No**: las flechas no hacen nada |
| 11 | Tab con el expediente cerrado | Siguiente sección (Contacto) | — | **No**: 11 paradas invisibles de "Información oculta" |
| 12 | Enter en "Abrir el expediente" | `aria-expanded="true"` y contenido visible | "Abrir el expediente, botón, expandido" | Sí (el texto cambia a "Cerrar el expediente") |

## Checklist de ARIA
| Elemento | Rol | Nombre | Estados | Teclado | Notas |
|---------|------|-------|--------|----------|-------|
| Menú principal | `nav` (aria-label "Secciones") | Sí | Sin `aria-current` | Sí | Recomendación 10 |
| Botón día/noche | button | Cambia | `aria-pressed` | Sí | Etiqueta y estado se pisan |
| Botones "Ver demo" y miniaturas de demo | button | Sí (texto o `aria-label`) | — | Sí | Bien |
| Modal `#vm` | dialog, `aria-modal="true"` | "Video" | `aria-hidden` cambia | Escape sí, foco retenido no | Crítico #1 |
| Cerrar modal | button | "Cerrar video" | — | Sí | Bien (ícono SVG con `aria-hidden`) |
| Pestañas del juego | tablist / tab | Sí | `aria-selected` | Solo Tab, sin flechas | Falta tabpanel |
| "Abrir el expediente" | button | Sí | `aria-expanded`, `aria-controls` | Sí | Bien |
| `.gm-redact` | span sin rol | `aria-label` no permitido | — | `tabindex="0"` sin acción | Críticos #2 y #4 |
| Maqueta de Hito | `role="img"` | `aria-label` descriptivo | — | — | Bien |
| Videos inline (15) | video | 3 con nombre, 12 sin nombre | Bucle automático | Sin pausa | Crítico #3 |
| Foto de "Sobre mí" | img | alt con el nombre | — | — | Bien |
| Botón WhatsApp (portafolio) | a | "Escribir por WhatsApp" | — | Sí | Bien |
| Funciones de la galería (portafolio) | li | Texto | Clase `.on` sin estado ARIA | **No** | Recomendación 8 |

## Detalle del veredicto
- Compatibilidad con lector de pantalla: **CON OBSERVACIONES**. Hay `aria-label` inválidos, videos sin nombre, contenido oculto que se anuncia y nombres de enlace largos.
- Navegación con teclado: **CON OBSERVACIONES**. Faltan el enlace para saltar al contenido, las flechas en las pestañas y el teclado en la galería del portafolio, y hay paradas de foco invisibles.
- Manejo del foco: **CON OBSERVACIONES**. Abrir, cerrar y devolver el foco en el modal funciona bien, pero el foco no queda retenido dentro.
- Contraste de color: **CON OBSERVACIONES**. Fallan 5 combinaciones, entre día y noche. El texto principal pasa.
- Sensibilidad al movimiento: **CON OBSERVACIONES**. `prefers-reduced-motion` está bien implementado: la esfera queda estática, las brasas no corren, los videos no arrancan y la entrada del hero se apaga. Pero los 15 videos en bucle no tienen control de pausa para quien no activa esa preferencia.

### Lo que ya está bien
Foco visible en todo el menú y los botones (`:focus-visible`). Un solo `h1`. `lang="es"`. La foto tiene `alt` y las imágenes decorativas `alt=""`. Los SVG decorativos llevan `aria-hidden`. Escape cierra el modal y el foco vuelve a su origen. `aria-expanded` funciona en el expediente. Los botones táctiles usan `touch-action: manipulation`. No hay `user-scalable=no`.
