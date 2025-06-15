// Saludo dinámico en el hero
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "¡Buenos días!";
  if (h < 19) return "¡Buenas tardes!";
  return "¡Buenas noches!";
}
document.getElementById('greeting').innerHTML = `${getGreeting()} <br> <span style="font-size:2.3rem;font-weight:500">LicitaSeguro</span>`;

// Animación de aparición de tarjetas de features al hacer scroll
function revealFeatures() {
  const cards = document.querySelectorAll('.feature-card');
  const trigger = window.innerHeight * 0.92;
  cards.forEach(card => {
    const top = card.getBoundingClientRect().top;
    if (top < trigger) card.classList.add('visible');
  });
}
window.addEventListener('scroll', revealFeatures);
window.addEventListener('load', revealFeatures);

// Slider de testimonios
const testimonios = [
  {
    texto: "¡Excelente plataforma! Encontré licitaciones perfectas para mi empresa en minutos.",
    autor: "María González, Gerente de Compras"
  },
  {
    texto: "La exportación a Excel y los filtros avanzados me ahorran mucho tiempo.",
    autor: "Vicente Zapata Concha, Consultor Senior"
  },
  {
    texto: "Muy fácil de usar y siempre actualizada. Recomendadísima.",
    autor: "Paula Torres, Proveedora"
  },
  {
  texto: "Simplemente, GENIAL.",
  autor: "Raul Bilbao, Proveedor"
}
];
let idx = 0;
const slider = document.getElementById('slider');
function mostrarTestimonio(i) {
  slider.innerHTML = `
    <div class="testimonio activo">
      <div class="texto">"${testimonios[i].texto}"</div>
      <div class="autor">${testimonios[i].autor}</div>
    </div>
  `;
}
mostrarTestimonio(idx);
document.getElementById('next').onclick = () => {
  idx = (idx + 1) % testimonios.length;
  mostrarTestimonio(idx);
};
document.getElementById('prev').onclick = () => {
  idx = (idx - 1 + testimonios.length) % testimonios.length;
  mostrarTestimonio(idx);
};
// Cambio automático cada 5 segundos
setInterval(() => {
  idx = (idx + 1) % testimonios.length;
  mostrarTestimonio(idx);
}, 5000);

// Año automático en el footer
document.getElementById('footer-year').textContent = new Date().getFullYear();
