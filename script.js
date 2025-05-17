const form = document.getElementById('criterioForm');
const lista = document.getElementById('criteriosLista');
const buscador = document.getElementById('buscador');
const editarForm = document.getElementById('editarForm');
const editNombre = document.getElementById('editNombre');
const editPorcentaje = document.getElementById('editPorcentaje');

let criterios = JSON.parse(localStorage.getItem('criterios')) || [];
let criterioSeleccionado = null;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nombre = form.nombre.value.trim();
  const porcentaje = parseInt(form.porcentaje.value);
  if (!nombre || isNaN(porcentaje)) return;

  criterios.push({ nombre, porcentaje });
  guardarCriterios();
  form.reset();
  renderLista();
});

buscador.addEventListener('input', () => {
  renderLista(buscador.value.toLowerCase());
  editarForm.classList.add('formulario');
});

editarForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!criterioSeleccionado) return;

  const nuevoNombre = editNombre.value.trim();
  const nuevoPorcentaje = parseInt(editPorcentaje.value);
  if (!nuevoNombre || isNaN(nuevoPorcentaje)) return;

  criterioSeleccionado.nombre = nuevoNombre;
  criterioSeleccionado.porcentaje = nuevoPorcentaje;
  guardarCriterios();
  editarForm.reset();
  editarForm.classList.add('formulario');
  renderLista(buscador.value.toLowerCase());
});

function renderLista(filtro = '') {
  lista.innerHTML = '';
  criterios
    .filter(c => c.nombre.toLowerCase().includes(filtro))
    .forEach((c, index) => {
      const row = document.createElement('tr');

      const nombreTd = document.createElement('td');
      nombreTd.textContent = c.nombre;

      const porcentajeTd = document.createElement('td');
      porcentajeTd.textContent = `${c.porcentaje}%`;

      const accionesTd = document.createElement('td');

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Modificar';
      editBtn.classList.add('btn-edit');
      editBtn.addEventListener('click', () => seleccionarCriterio(index));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Eliminar';
      deleteBtn.classList.add('btn-delete');
      deleteBtn.addEventListener('click', () => eliminarCriterio(index));

      accionesTd.appendChild(editBtn);
      accionesTd.appendChild(deleteBtn);

      row.appendChild(nombreTd);
      row.appendChild(porcentajeTd);
      row.appendChild(accionesTd);

      lista.appendChild(row);
    });
}

function seleccionarCriterio(index) {
  criterioSeleccionado = criterios[index];
  editNombre.value = criterioSeleccionado.nombre;
  editPorcentaje.value = criterioSeleccionado.porcentaje;
  editarForm.classList.remove('formulario');
}

function eliminarCriterio(index) {
  if (confirm('¿Estás seguro de que quieres eliminar este criterio?')) {
    criterios.splice(index, 1);
    guardarCriterios();
    editarForm.classList.add('formulario');
    renderLista(buscador.value.toLowerCase());
  }
}

function guardarCriterios() {
  localStorage.setItem('criterios', JSON.stringify(criterios));
}

renderLista(); 
