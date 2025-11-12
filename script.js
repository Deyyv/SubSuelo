

function toggleMenu() {
  const barra = document.getElementById("barra");
  const overlay = document.getElementById("overlay");
  const body = document.body;

  // Abre o cierra el menú
  const isActive = barra.classList.toggle("activo");
  overlay.classList.toggle("activo", isActive);

  // Bloquea el scroll del fondo solo cuando el menú está abierto
  body.classList.toggle("menu-abierto", isActive);
}

// ✅ Cierra solo si se hace clic en el overlay
document.getElementById("overlay").addEventListener("click", function() {
  const barra = document.getElementById("barra");
  const overlay = document.getElementById("overlay");
  const body = document.body;

  barra.classList.remove("activo");
  overlay.classList.remove("activo");
  body.classList.remove("menu-abierto");
});

// ✅ Permite hacer clic en los botones o enlaces dentro del menú
document.querySelectorAll("#barra button, #barra a").forEach(elemento => {
  elemento.addEventListener("click", function(event) {
    event.stopPropagation(); // evita cerrar el menú
    const url = this.getAttribute("data-url");
    if (url) window.open(url, "_blank"); // abre en nueva pestaña
  });
});


// Pié de página
window.addEventListener("scroll", () => {
  const footer = document.getElementById("footer");
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.body.offsetHeight;

  if (scrollPosition >= pageHeight - 10) {
    footer.classList.add("visible");
  } else {
    footer.classList.remove("visible");
  }
});
