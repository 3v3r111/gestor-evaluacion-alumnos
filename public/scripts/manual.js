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

// Descargar como PDF el contenido completo del manual
export function configurarBotonDescarga() {
  const btnDescargar = document.getElementById('btnDescargarManual');
  if (!btnDescargar) return;

  btnDescargar.addEventListener('click', () => {
    const contenido = document.querySelector('.manual-content');
    if (!contenido) {
      mostrarModal("⚠️ No se pudo encontrar el contenido del manual.");
      return;
    }

    // Mostrar todas las secciones antes de generar PDF
    const secciones = document.querySelectorAll('.detalle-manual');
    const ocultas = [];

    secciones.forEach(sec => {
      if (sec.classList.contains('oculto')) {
        ocultas.push(sec);
        sec.classList.remove('oculto');
      }
    });

    // Ocultar mensaje de bienvenida si está visible
    const mensajeInicial = document.getElementById('mensajeInicial');
    const mensajeVisible = mensajeInicial && mensajeInicial.style.display !== 'none';
    if (mensajeVisible) mensajeInicial.style.display = 'none';

    const opt = {
      margin: 0.5,
      filename: `Manual_Usuario_Sistema.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(contenido).set(opt).save().then(() => {
      // Restaurar estado anterior
      ocultas.forEach(sec => sec.classList.add('oculto'));
      if (mensajeVisible) mensajeInicial.style.display = 'block';
    });
  });
}


