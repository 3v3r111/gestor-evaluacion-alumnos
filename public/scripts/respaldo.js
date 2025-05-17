const btnExportar = document.getElementById('btnExportar');
const btnImportar = document.getElementById('btnImportar');
const inputArchivo = document.getElementById('inputArchivo');

// === Exportar todo localStorage a archivo .json ===
btnExportar.addEventListener('click', () => {
  const datos = {};

  for (let i = 0; i < localStorage.length; i++) {
    const clave = localStorage.key(i);
    const valor = localStorage.getItem(clave);
    try {
      datos[clave] = JSON.parse(valor);
    } catch (e) {
      datos[clave] = valor;
    }
  }

  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `respaldo_GEA_${new Date().toISOString().split('T')[0]}.json`;
  enlace.click();
});

// === Importar archivo .json al sistema ===
btnImportar.addEventListener('click', () => {
  const archivo = inputArchivo.files[0];
  if (!archivo) {
    mostrarModal("⚠️ Por favor selecciona un archivo .json antes de importar.");
    return;
  }

  const lector = new FileReader();
  lector.onload = function(e) {
    try {
      const datosImportados = JSON.parse(e.target.result);

      if (typeof datosImportados !== 'object' || Array.isArray(datosImportados)) {
        mostrarModal("❌ El archivo no tiene una estructura válida de respaldo.");
        return;
      }

      const confirmacion = confirm("Esto reemplazará los datos actuales del sistema. ¿Deseas continuar?");
      if (!confirmacion) return;

      for (const clave in datosImportados) {
        localStorage.setItem(clave, JSON.stringify(datosImportados[clave]));
      }

      mostrarModal("✅ Respaldo importado correctamente. Refresca la página para ver los cambios.");
    } catch (err) {
      mostrarModal("❌ Error al leer el archivo. Asegúrate de que sea un respaldo válido.");
    }
  };

  lector.readAsText(archivo);
});

// === Modal simple ===
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
