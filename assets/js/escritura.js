// Hero: frase que se escribe y se borra sola

(() => {
// Frase que se escribe sola bajo el nombre
const phrases = [
    "Transformar ideas en soluciones digitales.",
    "Crear software que impacta vidas.",
    "Unir la lógica del código con la empatía del negocio.",
    "Construir el futuro, una línea a la vez.",
    "Resolver problemas reales con tecnología real."
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingElement = document.getElementById('typingText');

function typeEffect() {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentPhrase.length) {
            isDeleting = true;
            setTimeout(typeEffect, 2000);
            return;
        }
    } else {
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }
    }
    setTimeout(typeEffect, isDeleting ? 30 : 60);
}

typeEffect();

})();
