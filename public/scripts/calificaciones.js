// === ELEMENTOS DEL DOM ===
const seccionSeleccionClase = document.getElementById('seccionSeleccionClase');
const seccionAlumnos = document.getElementById('seccionAlumnos');
const seccionCalificaciones = document.getElementById('seccionCalificaciones');
const seccionEditarCriterio = document.getElementById('seccionEditarCriterio');

const criterioActivoNombre = document.getElementById('criterioActivoNombre');
const formCalificacion = document.getElementById('formCalificacion');
const tablaCalificacionesCriterio = document.getElementById('tablaCalificacionesCriterio');
const volverCriterios = document.getElementById('volverCriterios');
const tablaClases = document.getElementById('tablaClases');
const buscadorClase = document.getElementById('buscadorClase');
const infoClase = document.getElementById('infoClase');
const tablaAlumnos = document.getElementById('tablaAlumnos');
const nombreAlumno = document.getElementById('nombreAlumno');
const tablaCalificacionesCriterios = document.getElementById('tablaCalificacionesCriterios');
const promedioFinal = document.getElementById('promedioFinal');

const volverClases = document.getElementById('volverClases');
const volverAlumnos = document.getElementById('volverAlumnos');



// === VARIABLES DE ESTADO ===
let clases = JSON.parse(localStorage.getItem('listas')) || [];
let claseSeleccionada = null;
let alumnos = [];
let alumnoSeleccionado = null;
let criterios = [];
let criterioActivo = '';
let listaCalificaciones = [];
let editandoIndice = -1;

// === RENDER DE CLASES ===
function renderClases(filtro = '') {
  tablaClases.innerHTML = '';
  const filtradas = clases.filter(clase =>
    clase.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  filtradas.forEach(clase => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${clase.nombre}</td>
      <td>${clase.codigo || '-'}</td>
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

// === SELECCIONAR CLASE ===
window.seleccionarClase = function(id) {
  claseSeleccionada = clases.find(c => c.id === id);
  alumnos = JSON.parse(localStorage.getItem(`alumnos_${id}`)) || [];
  criterios = JSON.parse(localStorage.getItem(`criterios_${id}`)) || [];

  mostrarInfoClase();
  renderAlumnos();

  seccionSeleccionClase.style.display = 'none';
  seccionAlumnos.style.display = 'block';
};

function mostrarInfoClase() {
  infoClase.innerHTML = `
    <p><strong>Nombre:</strong> ${claseSeleccionada.nombre}</p>
    <p><strong>Código:</strong> ${claseSeleccionada.codigo || '-'}</p>
    <p><strong>Grupo:</strong> ${claseSeleccionada.grupo || '-'}</p>
  `;
}

// === RENDER DE ALUMNOS ===
function renderAlumnos() {
  tablaAlumnos.innerHTML = '';
  alumnos.forEach((a, i) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${a.nombre}</td>
      <td>${a.matricula}</td>
      <td>${a.grupo}</td>
      <td><button onclick="seleccionarAlumno(${i})">Seleccionar</button></td>
    `;
    tablaAlumnos.appendChild(fila);
  });
}

// === SELECCIONAR ALUMNO ===
window.seleccionarAlumno = function(index) {
  alumnoSeleccionado = alumnos[index];
  nombreAlumno.textContent = alumnoSeleccionado.nombre;

  renderCalificacionesPorCriterio();
  calcularPromedioFinal();

  seccionAlumnos.style.display = 'none';
  seccionCalificaciones.style.display = 'block';
};

// === RENDER DE CALIFICACIONES POR CRITERIO ===
function renderCalificacionesPorCriterio() {
  tablaCalificacionesCriterios.innerHTML = '';

  criterios.forEach(criterio => {
    const promedio = calcularPromedioCriterio(criterio.nombre);
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${criterio.nombre} (${criterio.porcentaje}%)</td>
      <td>${promedio.toFixed(2)}</td>
      <td><button onclick="editarCriterio('${criterio.nombre}')">Editar</button></td>
    `;
    tablaCalificacionesCriterios.appendChild(fila);
  });
}

// === CALCULAR PROMEDIO DE UN CRITERIO ===
function calcularPromedioCriterio(nombreCriterio) {
  const key = `calificaciones_${claseSeleccionada.id}_${alumnoSeleccionado.matricula}_${nombreCriterio}`;
  const lista = JSON.parse(localStorage.getItem(key)) || [];

  let total = 0;
  lista.forEach(entry => {
    total += (entry.valor * entry.porcentaje) / 100;
  });

  return total;
}

// === CALCULAR PROMEDIO FINAL ===
function calcularPromedioFinal() {
  let promedio = 0;

  criterios.forEach(criterio => {
    const califCriterio = calcularPromedioCriterio(criterio.nombre);
    promedio += (califCriterio * criterio.porcentaje) / 100;
  });

  promedioFinal.textContent = promedio.toFixed(2);
}

// === BOTONES DE NAVEGACIÓN ===
volverClases.addEventListener('click', () => {
  claseSeleccionada = null;
  seccionAlumnos.style.display = 'none';
  seccionSeleccionClase.style.display = 'block';
});

volverAlumnos.addEventListener('click', () => {
  alumnoSeleccionado = null;
  seccionCalificaciones.style.display = 'none';
  seccionAlumnos.style.display = 'block';
});

// === INICIALIZAR ===
renderClases();

// === EDITAR CRITERIO ===
window.editarCriterio = function(nombreCriterio) {
  criterioActivo = nombreCriterio;
  criterioActivoNombre.textContent = nombreCriterio;

  cargarCalificaciones();
  renderCalificaciones();

  seccionCalificaciones.style.display = 'none';
  seccionEditarCriterio.style.display = 'block';
};

// === VOLVER A VISTA DE CRITERIOS ===
volverCriterios.addEventListener('click', () => {
  criterioActivo = '';
  seccionEditarCriterio.style.display = 'none';
  seccionCalificaciones.style.display = 'block';
  renderCalificacionesPorCriterio();
  calcularPromedioFinal();
});

// === GUARDAR EN STORAGE Y CARGAR ===
function getStorageKey() {
  return `calificaciones_${claseSeleccionada.id}_${alumnoSeleccionado.matricula}_${criterioActivo}`;
}

function guardarCalificaciones() {
  localStorage.setItem(getStorageKey(), JSON.stringify(listaCalificaciones));
}

function cargarCalificaciones() {
  listaCalificaciones = JSON.parse(localStorage.getItem(getStorageKey())) || [];
}

// === RENDER TABLA INTERNA DE CALIFICACIONES ===
function renderCalificaciones() {
  tablaCalificacionesCriterio.innerHTML = '';
  listaCalificaciones.forEach((c, i) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${c.nombre}</td>
      <td>${c.valor}</td>
      <td>${c.porcentaje}%</td>
      <td>
        <button class="btn-edit" onclick="editarCalificacion(${i})">Modificar</button>
        <button class="btn-delete" onclick="eliminarCalificacion(${i})">Eliminar</button>
      </td>
    `;
    tablaCalificacionesCriterio.appendChild(fila);
  });
}

// === AGREGAR / EDITAR CALIFICACIÓN ===
formCalificacion.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = formCalificacion.nombre.value.trim();
  const valor = parseFloat(formCalificacion.valor.value);
  let porcentaje = parseFloat(formCalificacion.porcentaje.value);

  if (!nombre || isNaN(valor) || isNaN(porcentaje)) return;

  if (editandoIndice >= 0) {
    listaCalificaciones[editandoIndice] = { nombre, valor, porcentaje };
    editandoIndice = -1;
  } else {
    listaCalificaciones.push({ nombre, valor, porcentaje });
  }

  // VALIDAR SUMA TOTAL
  const total = listaCalificaciones.reduce((sum, c) => sum + c.porcentaje, 0);
  if (total > 100) {
    mostrarModal("⚠️ Se ha superado el 100%. Redistribuyendo porcentajes...");
    
    // REDISTRIBUCIÓN PROPORCIONAL
    const totalActual = listaCalificaciones.reduce((sum, c) => sum + c.porcentaje, 0);
    listaCalificaciones.forEach(c => {
      c.porcentaje = Math.round((c.porcentaje / totalActual) * 100);
    });

    const totalFinal = listaCalificaciones.reduce((sum, c) => sum + c.porcentaje, 0);
    if (totalFinal > 100) {
      const extra = totalFinal - 100;
      listaCalificaciones[0].porcentaje -= extra; // ajuste mínimo al primero
    }

  }

  guardarCalificaciones();
  formCalificacion.reset();
  renderCalificaciones();
});

// === EDITAR CALIFICACIÓN ===
window.editarCalificacion = function(index) {
  const c = listaCalificaciones[index];
  formCalificacion.nombre.value = c.nombre;
  formCalificacion.valor.value = c.valor;
  formCalificacion.porcentaje.value = c.porcentaje;
  editandoIndice = index;
};

// === ELIMINAR CALIFICACIÓN ===
window.eliminarCalificacion = function(index) {
    mostrarConfirmacion('¿Deseas eliminar esta calificación?', () => {
    listaCalificaciones.splice(index, 1);
    guardarCalificaciones();
    renderCalificaciones();
  });
};

export function mostrarModal(mensaje) {
  const modal = document.getElementById('modalSistema');
  const mensajeElemento = document.getElementById('modalMensaje');
  const cerrar = document.getElementById('cerrarModal');

  mensajeElemento.textContent = mensaje;
  modal.classList.remove('oculto');

  cerrar.onclick = () => {
    modal.classList.add('oculto');

    // Restablecer focus en el primer campo activo si existe
    const primerCampo = document.querySelector('input:not([type=hidden]):not([disabled])');
    if (primerCampo) primerCampo.focus();
  };
}

function mostrarConfirmacion(mensaje, accionAceptar) {
  const modal = document.getElementById('modalConfirmacion');
  const mensajeElemento = document.getElementById('mensajeConfirmacion');
  const btnConfirmar = document.getElementById('btnConfirmar');
  const btnCancelar = document.getElementById('btnCancelarConfirmacion');

  mensajeElemento.textContent = mensaje;
  modal.classList.remove('oculto');

  // Remover eventos previos para evitar acumulación
  btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
  btnCancelar.replaceWith(btnCancelar.cloneNode(true));

  const nuevoConfirmar = document.getElementById('btnConfirmar');
  const nuevoCancelar = document.getElementById('btnCancelarConfirmacion');

  nuevoConfirmar.onclick = () => {
    modal.classList.add('oculto');
    accionAceptar(); // Ejecuta lo que se debía hacer si se acepta
  };

  nuevoCancelar.onclick = () => {
    modal.classList.add('oculto');
  };
}

