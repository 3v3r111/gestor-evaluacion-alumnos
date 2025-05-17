const tablaClases = document.getElementById('tablaClases');
const buscadorClase = document.getElementById('buscadorClase');
const seccionSeleccionClase = document.getElementById('seccionSeleccionClase');
const seccionReporte = document.getElementById('seccionReporte');
const contenidoReporte = document.getElementById('contenidoReporte');
const btnDescargarPDF = document.getElementById('btnDescargarPDF');
const btnVolver = document.getElementById('btnVolver');

let clases = JSON.parse(localStorage.getItem('listas')) || [];
let claseSeleccionada = null;

// === RENDER CLASES PARA SELECCIÓN ===
function renderClases(filtro = '') {
  tablaClases.innerHTML = '';
  const filtradas = clases.filter(c => c.nombre.toLowerCase().includes(filtro.toLowerCase()));

  filtradas.forEach(clase => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${clase.nombre}</td>
      <td>${clase.materia || '-'}</td>
      <td>${clase.grupo || '-'}</td>
      <td><button onclick="seleccionarClase('${clase.id}')">Seleccionar</button></td>
    `;
    tablaClases.appendChild(fila);
  });
}

buscadorClase.addEventListener('input', () => {
  renderClases(buscadorClase.value);
});

// === SELECCIONAR CLASE Y GENERAR REPORTE ===
window.seleccionarClase = function(id) {
  claseSeleccionada = clases.find(c => c.id === id);
  if (!claseSeleccionada) return;

  generarContenidoReporte();
  seccionSeleccionClase.style.display = 'none';
  seccionReporte.style.display = 'block';
};

btnVolver.addEventListener('click', () => {
  claseSeleccionada = null;
  contenidoReporte.innerHTML = '';
  seccionReporte.style.display = 'none';
  seccionSeleccionClase.style.display = 'block';
});

// === CONSTRUCCIÓN DEL CONTENIDO DEL REPORTE ===
function generarContenidoReporte() {
  const alumnos = JSON.parse(localStorage.getItem(`alumnos_${claseSeleccionada.id}`)) || [];
  const criterios = JSON.parse(localStorage.getItem(`criterios_${claseSeleccionada.id}`)) || [];

  let html = `
    <h2>Reporte de la Clase</h2>
    <p><strong>Nombre:</strong> ${claseSeleccionada.nombre}</p>
    <p><strong>Materia:</strong> ${claseSeleccionada.materia || '-'}</p>
    <p><strong>Grupo:</strong> ${claseSeleccionada.grupo || '-'}</p>
    <p><strong>Código:</strong> ${claseSeleccionada.codigo || '-'}</p>
    <p><strong>Horario:</strong> ${claseSeleccionada.horario || '-'}</p>

    <h3>Criterios de Evaluación</h3>
    <ul>
      ${criterios.map(c => `<li>${c.nombre} (${c.porcentaje}%)</li>`).join('')}
    </ul>

    <h3>Alumnos y Calificaciones</h3>
    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Matrícula</th>
          <th>Notas</th>
          ${criterios.map(c => `<th>${c.nombre}</th>`).join('')}
          <th>Promedio Final</th>
        </tr>
      </thead>
      <tbody>
  `;

  alumnos.forEach(alumno => {
    const calificacionesPorCriterio = criterios.map(criterio => {
      const key = `calificaciones_${claseSeleccionada.id}_${alumno.matricula}_${criterio.nombre}`;
      const calificaciones = JSON.parse(localStorage.getItem(key)) || [];

      const promedio = calificaciones.reduce((acc, c) => acc + (c.valor * c.porcentaje / 100), 0);
      return promedio.toFixed(2);
    });

    const promedioFinal = criterios.reduce((acc, criterio, i) => {
      return acc + (parseFloat(calificacionesPorCriterio[i]) * criterio.porcentaje / 100);
    }, 0).toFixed(2);

    html += `
      <tr>
        <td>${alumno.nombre}</td>
        <td>${alumno.matricula}</td>
        <td>${alumno.notas || '-'}</td>
        ${calificacionesPorCriterio.map(c => `<td>${c}</td>`).join('')}
        <td><strong>${promedioFinal}</strong></td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  contenidoReporte.innerHTML = html;
}

// === DESCARGAR REPORTE COMO PDF ===
btnDescargarPDF.addEventListener('click', () => {
  const opt = {
    margin:       0.5,
    filename:     `Reporte_${claseSeleccionada.nombre}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(contenidoReporte).set(opt).save();
});

// Inicializar clases
renderClases();
