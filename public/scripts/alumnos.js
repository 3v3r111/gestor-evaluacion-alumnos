// === ELEMENTOS DEL DOM ===
const seccionSeleccionClase = document.getElementById('seccionSeleccionClase');
const seccionAlumnos = document.getElementById('seccionAlumnos');
const tablaClases = document.getElementById('tablaClases');
const buscadorClase = document.getElementById('buscadorClase');

const infoClase = document.getElementById('infoClase');
const formAlumno = document.getElementById('formAlumno');
const tablaAlumnos = document.getElementById('tablaAlumnos');
const volverBtn = document.getElementById('volver');

const formEditar = document.getElementById('formEditar');
const editNombre = document.getElementById('editNombre');
const editMatricula = document.getElementById('editMatricula');
const editGrupo = document.getElementById('editGrupo');
const editNotas = document.getElementById('editNotas');

let clases = JSON.parse(localStorage.getItem('listas')) || [];
let alumnos = [];
let claseSeleccionada = null;
let alumnoSeleccionado = null;

// === RENDER DE CLASES DISPONIBLES ===
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
      <td><button onclick="seleccionarClase('${clase.id}')">Seleccionar</button></td>
    `;
    tablaClases.appendChild(fila);
  });
}

buscadorClase.addEventListener('input', () => {
  renderClases(buscadorClase.value);
});

// === SELECCIÓN DE CLASE ===
window.seleccionarClase = function(idClase) {
  claseSeleccionada = clases.find(c => c.id === idClase);
  alumnos = JSON.parse(localStorage.getItem(`alumnos_${idClase}`)) || [];

  mostrarInfoClase();
  renderAlumnos();

  seccionSeleccionClase.style.display = 'none';
  seccionAlumnos.style.display = 'block';
}

volverBtn.addEventListener('click', () => {
  claseSeleccionada = null;
  alumnoSeleccionado = null;
  seccionAlumnos.style.display = 'none';
  seccionSeleccionClase.style.display = 'block';
});

// === INFO DE LA CLASE ===
function mostrarInfoClase() {
  infoClase.innerHTML = `
    <p><strong>Nombre:</strong> ${claseSeleccionada.nombre}</p>
    <p><strong>Código:</strong> ${claseSeleccionada.codigo || '-'}</p>
    <p><strong>Materia:</strong> ${claseSeleccionada.materia || '-'}</p>
    <p><strong>Grupo:</strong> ${claseSeleccionada.grupo || '-'}</p>
  `;
}

// === REGISTRAR NUEVO ALUMNO ===
formAlumno.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = formAlumno.nombre.value.trim();
  const matricula = formAlumno.matricula.value.trim();
  const notas = formAlumno.notas.value.trim();

  if (!nombre || !matricula) return;

  // Validación de matrícula duplicada
  const duplicado = alumnos.find(a => a.matricula === matricula);
  if (duplicado) {
    mostrarModal(`⚠️ La matrícula ya está registrada. Pertenece a: ${duplicado.nombre}`);
    return;
  }

  const grupo = claseSeleccionada.grupo || '-';
  alumnos.push({ nombre, matricula, grupo, notas });
  guardarAlumnos();
  formAlumno.reset();
  renderAlumnos();
});

// === GUARDAR CAMBIOS EN EDICIÓN ===
formEditar.addEventListener('submit', e => {
  e.preventDefault();
  if (!alumnoSeleccionado) return;

  const nuevoNombre = editNombre.value.trim();
  const nuevaMatricula = editMatricula.value.trim();

  if (!nuevoNombre || !nuevaMatricula) return;

  // Validar si otra matrícula ya existe
  const conflicto = alumnos.find(a =>
    a.matricula === nuevaMatricula && a !== alumnoSeleccionado
  );
  if (conflicto) {
    mostrarModal(`⚠️ Ya existe otro alumno con esa matrícula: ${conflicto.nombre}`);
    return;
  }

  const grupo = claseSeleccionada.grupo || '-';
  alumnoSeleccionado.nombre = nuevoNombre;
  alumnoSeleccionado.matricula = nuevaMatricula;
  alumnoSeleccionado.grupo = grupo;
  const nuevasNotas = editNotas.value.trim();
  alumnoSeleccionado.notas = nuevasNotas;

  guardarAlumnos();
  formEditar.reset();
  formEditar.classList.add('formulario');
  renderAlumnos();
});

// === RENDER DE ALUMNOS ===
function renderAlumnos(filtro = '') {
  tablaAlumnos.innerHTML = '';
  const alumnosFiltrados = alumnos.filter(a => {
    const texto = `${a.nombre} ${a.matricula} ${a.notas}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  alumnosFiltrados.forEach((a, i) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${a.nombre}</td>
      <td>${a.matricula}</td>
      <td>${a.grupo || '-'}</td>
      <td>
        <button class="btn-edit" onclick="editarAlumno(${i})">Modificar</button>
        <button class="btn-delete" onclick="eliminarAlumno(${i})">Eliminar</button>
      </td>
    `;
    tablaAlumnos.appendChild(fila);
  });
}

buscadorAlumnos.addEventListener('input', () => {
  renderAlumnos(buscadorAlumnos.value);
});

// === EDITAR ALUMNO ===
window.editarAlumno = function(index) {
  alumnoSeleccionado = alumnos[index];
  editNombre.value = alumnoSeleccionado.nombre;
  editMatricula.value = alumnoSeleccionado.matricula;
  editNotas.value = alumnoSeleccionado.notas || '';
  formEditar.classList.remove('formulario');
}

// === ELIMINAR ALUMNO ===
window.eliminarAlumno = function(index) {
    mostrarConfirmacion('¿Eliminar este alumno?', () => {
      alumnos.splice(index, 1);
      guardarAlumnos();
      formEditar.classList.add('formulario');
      renderAlumnos();
  });
}

// === GUARDAR EN LOCALSTORAGE ===
function guardarAlumnos() {
  if (claseSeleccionada) {
    localStorage.setItem(`alumnos_${claseSeleccionada.id}`, JSON.stringify(alumnos));
  }
}

// === INICIALIZAR ===
renderClases();

function mostrarConfirmacion(mensaje, accionAceptar) {
  const modal = document.getElementById('modalConfirmacion');
  const mensajeElemento = document.getElementById('mensajeConfirmacion');
  const btnConfirmar = document.getElementById('btnConfirmar');
  const btnCancelar = document.getElementById('btnCancelarConfirmacion');

  mensajeElemento.textContent = mensaje;
  modal.classList.remove('oculto');

  btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
  btnCancelar.replaceWith(btnCancelar.cloneNode(true));

  const nuevoConfirmar = document.getElementById('btnConfirmar');
  const nuevoCancelar = document.getElementById('btnCancelarConfirmacion');

  nuevoConfirmar.onclick = () => {
    modal.classList.add('oculto');
    accionAceptar();
  };

  nuevoCancelar.onclick = () => {
    modal.classList.add('oculto');
  };
}

function mostrarModal(mensaje) {
  const modal = document.getElementById('modalSistema');
  const mensajeElemento = document.getElementById('modalMensaje');
  const cerrar = document.getElementById('cerrarModal');

  mensajeElemento.textContent = mensaje;
  modal.classList.remove('oculto');

  cerrar.onclick = () => {
    modal.classList.add('oculto');
    const campo = document.querySelector('input:not([disabled])');
    if (campo) campo.focus();
  };
}
