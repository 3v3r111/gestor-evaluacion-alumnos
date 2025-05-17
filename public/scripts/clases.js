// Elementos del DOM
const vistaLista = document.getElementById('vistaListaClases');
const vistaFormulario = document.getElementById('vistaFormulario');
const tablaClases = document.getElementById('tablaClases');
const buscadorClases = document.getElementById('buscadorClases');
const formClase = document.getElementById('formClase');
const btnIrARegistro = document.getElementById('btnIrARegistro');
const btnCancelar = document.getElementById('cancelarFormulario');
const tituloFormulario = document.getElementById('tituloFormulario');

let clases = JSON.parse(localStorage.getItem('listas')) || [];
let claseEditando = null;

// ===============================
// RENDER DE LA TABLA DE CLASES
// ===============================
function renderClases(filtro = '') {
  tablaClases.innerHTML = '';

  const filtradas = clases.filter(clase =>
    clase.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (clase.codigo && clase.codigo.toLowerCase().includes(filtro.toLowerCase()))
  );

  filtradas.forEach(clase => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${clase.nombre}</td>
      <td>${clase.codigo || '-'}</td>
      <td>${clase.materia || '-'}</td>
      <td>${clase.grupo || '-'}</td>
      <td>${clase.horario || '-'}</td>
      <td>
        <button class="btn-edit" onclick="editarClase('${clase.id}')">Modificar</button>
        <button class="btn-delete" onclick="eliminarClase('${clase.id}')">Eliminar</button>
      </td>
    `;
    tablaClases.appendChild(fila);
  });
}

// ===============================
// FUNCIONES DE FORMULARIO
// ===============================
btnIrARegistro.addEventListener('click', () => {
  claseEditando = null;
  tituloFormulario.textContent = 'Registrar Clase';
  formClase.reset();
  vistaLista.style.display = 'none';
  vistaFormulario.style.display = 'block';
});

btnCancelar.addEventListener('click', () => {
  vistaFormulario.style.display = 'none';
  vistaLista.style.display = 'block';
  claseEditando = null;
});

formClase.addEventListener('submit', e => {
  e.preventDefault();

  const nuevaClase = {
    nombre: formClase.nombre.value.trim(),
    codigo: formClase.codigo.value.trim(),
    materia: formClase.materia.value.trim(),
    grupo: formClase.grupo.value.trim(),
    horario: formClase.horario.value.trim()
  };

  if (claseEditando) {
    // Editar clase existente
    const index = clases.findIndex(c => c.id === claseEditando.id);
    if (index !== -1) {
      clases[index] = { ...claseEditando, ...nuevaClase };
    }
  } else {
    // Agregar clase nueva
    nuevaClase.id = 'clase_' + Date.now();
    clases.push(nuevaClase);
  }

  guardarClases();
  renderClases();
  vistaFormulario.style.display = 'none';
  vistaLista.style.display = 'block';
});

buscadorClases.addEventListener('input', () => {
  renderClases(buscadorClases.value);
});

// ===============================
// FUNCIONES CRUD
// ===============================
window.editarClase = function(id) {
  claseEditando = clases.find(c => c.id === id);
  if (!claseEditando) return;

  formClase.nombre.value = claseEditando.nombre;
  formClase.codigo.value = claseEditando.codigo || '';
  formClase.materia.value = claseEditando.materia || '';
  formClase.grupo.value = claseEditando.grupo || '';
  formClase.horario.value = claseEditando.horario || '';

  tituloFormulario.textContent = 'Editar Clase';
  vistaLista.style.display = 'none';
  vistaFormulario.style.display = 'block';
};

window.eliminarClase = function(id) {
  mostrarConfirmacion('¿Deseas eliminar esta clase?', () => {
    clases = clases.filter(c => c.id !== id);
    guardarClases();
    renderClases(buscadorClases.value);
  });
};

function guardarClases() {
  localStorage.setItem('listas', JSON.stringify(clases));
}

// Inicializar tabla
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

