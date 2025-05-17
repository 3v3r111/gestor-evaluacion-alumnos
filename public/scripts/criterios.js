const seccionSeleccionClase = document.getElementById('seccionSeleccionClase');
const seccionCriterios = document.getElementById('seccionCriterios');
const tablaClases = document.getElementById('tablaClases');
const buscadorClase = document.getElementById('buscadorClase');

const infoClase = document.getElementById('infoClase');
const tablaCriterios = document.getElementById('tablaCriterios');
const criterioForm = document.getElementById('criterioForm');
const editarForm = document.getElementById('editarForm');
const editNombre = document.getElementById('editNombre');
const editPorcentaje = document.getElementById('editPorcentaje');
const volverBtn = document.getElementById('volver');

let clases = JSON.parse(localStorage.getItem('listas')) || [];
let claseSeleccionada = null;
let criterios = [];
let criterioSeleccionado = null;

// ==============================
// CARGA DE CLASES Y BUSCADOR
// ==============================

function renderClases(filtro = '') {
  tablaClases.innerHTML = '';
  const clasesFiltradas = clases.filter(c =>
    c.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  clasesFiltradas.forEach(clase => {
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

// ==============================
// SELECCIÓN DE CLASE
// ==============================

window.seleccionarClase = function(idClase) {
  claseSeleccionada = clases.find(c => c.id === idClase);
  criterios = JSON.parse(localStorage.getItem(`criterios_${idClase}`)) || [];

  mostrarInfoClase();
  renderCriterios();

  seccionSeleccionClase.style.display = 'none';
  seccionCriterios.style.display = 'block';
}

volverBtn.addEventListener('click', () => {
  claseSeleccionada = null;
  criterioSeleccionado = null;
  seccionCriterios.style.display = 'none';
  seccionSeleccionClase.style.display = 'block';
});

// ==============================
// MOSTRAR INFO DE CLASE
// ==============================

function mostrarInfoClase() {
  if (!claseSeleccionada) return;
  infoClase.innerHTML = `
    <p><strong>Nombre:</strong> ${claseSeleccionada.nombre}</p>
    <p><strong>Código:</strong> ${claseSeleccionada.codigo || '-'}</p>
    <p><strong>Materia:</strong> ${claseSeleccionada.materia || '-'}</p>
    <p><strong>Grupo:</strong> ${claseSeleccionada.grupo || '-'}</p>
  `;
}

// ==============================
// CRUD DE CRITERIOS
// ==============================

criterioForm.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = criterioForm.nombre.value.trim();
  const porcentaje = parseInt(criterioForm.porcentaje.value);

  if (!nombre || isNaN(porcentaje)) return;

  const total = criterios.reduce((sum, c) => sum + c.porcentaje, 0);
  if (total + porcentaje > 100) {
    mostrarModal('⚠️ El porcentaje total supera el 100%. Por favor ajusta los valores.');
    return;
  }

  criterios.push({ nombre, porcentaje });
  guardarCriterios();
  criterioForm.reset();
  renderCriterios();
});

editarForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!criterioSeleccionado) return;

  const nuevoNombre = editNombre.value.trim();
  const nuevoPorcentaje = parseInt(editPorcentaje.value);

  const totalSinActual = criterios
    .filter(c => c !== criterioSeleccionado)
    .reduce((sum, c) => sum + c.porcentaje, 0);

  if (totalSinActual + nuevoPorcentaje > 100) {
    mostrarModal('⚠️ El porcentaje total supera el 100%. Por favor ajusta los valores.');
    return;
  }

  criterioSeleccionado.nombre = nuevoNombre;
  criterioSeleccionado.porcentaje = nuevoPorcentaje;
  guardarCriterios();
  editarForm.reset();
  editarForm.classList.add('formulario');
  renderCriterios();
});

function renderCriterios() {
  tablaCriterios.innerHTML = '';
  criterios.forEach((c, index) => {
    const fila = document.createElement('tr');

    const nombreTd = document.createElement('td');
    nombreTd.textContent = c.nombre;

    const porcentajeTd = document.createElement('td');
    porcentajeTd.textContent = `${c.porcentaje}%`;

    const accionesTd = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Modificar';
    editBtn.classList.add('btn-edit');
    editBtn.onclick = () => seleccionarCriterio(index);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.classList.add('btn-delete');
    deleteBtn.onclick = () => eliminarCriterio(index);

    accionesTd.appendChild(editBtn);
    accionesTd.appendChild(deleteBtn);

    fila.appendChild(nombreTd);
    fila.appendChild(porcentajeTd);
    fila.appendChild(accionesTd);

    tablaCriterios.appendChild(fila);
  });
}

function seleccionarCriterio(index) {
  criterioSeleccionado = criterios[index];
  editNombre.value = criterioSeleccionado.nombre;
  editPorcentaje.value = criterioSeleccionado.porcentaje;
  editarForm.classList.remove('formulario');
}

function eliminarCriterio(index) {
    mostrarConfirmacion('¿Eliminar este criterio?', () => {
      criterios.splice(index, 1);
      guardarCriterios();
      editarForm.classList.add('formulario');
      renderCriterios();
  });
}

function guardarCriterios() {
  if (claseSeleccionada) {
    localStorage.setItem(`criterios_${claseSeleccionada.id}`, JSON.stringify(criterios));
  }
}

// Inicializar lista de clases al cargar
renderClases();

function mostrarModal(mensaje) {
  const modal = document.getElementById('modalSistema');
  const mensajeElemento = document.getElementById('modalMensaje');
  const cerrar = document.getElementById('cerrarModal');

  mensajeElemento.textContent = mensaje;
  modal.classList.remove('oculto');

  cerrar.onclick = () => {
    modal.classList.add('oculto');
    const primerCampo = document.querySelector('input:not([disabled])');
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

  // Remover eventos previos
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
