// Mostrar solo una sección del manual
export function mostrarSeccion(id) {
  const mensaje = document.getElementById('mensajeInicial');
  const secciones = document.querySelectorAll('.detalle-manual');

  mensaje.style.display = 'none';
  secciones.forEach(sec => sec.classList.add('oculto'));

  const activa = document.getElementById(`seccion-${id}`);
  if (activa) {
    activa.classList.remove('oculto');
  }
}

// Mostrar mensaje en modal
export function mostrarModal(mensaje) {
  const modal = document.getElementById('modalSistema');
  const mensajeElemento = document.getElementById('modalMensaje');
  const cerrar = document.getElementById('cerrarModal');

  mensajeElemento.textContent = mensaje;
  modal.classList.remove('oculto');

  cerrar.onclick = () => {
    modal.classList.add('oculto');
  };
}

// Descargar como PDF la sección actualmente visible
export function configurarBotonDescarga() {
  const btnDescargar = document.getElementById('btnDescargarManual');
  if (!btnDescargar) return;

  btnDescargar.addEventListener('click', () => {
    const seccionesVisibles = document.querySelectorAll('.detalle-manual:not(.oculto)');
    if (seccionesVisibles.length === 0) {
      mostrarModal("⚠️ Primero selecciona una sección para poder descargarla.");
      return;
    }

    const seccion = seccionesVisibles[0];
    const nombre = seccion.id.replace('seccion-', '').toUpperCase();

    const opt = {
      margin: 0.5,
      filename: `Manual_${nombre}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(seccion).set(opt).save();
  });
}
