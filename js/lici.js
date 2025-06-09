const url = 'API/licitaciones.json';
const porPagina = 7;
let datos = [];
let paginaActual = 1;
let filtro = '';
let fechaDesde = '';
let fechaHasta = '';
let estadoFiltro = '';

document.addEventListener('DOMContentLoaded', () => {
  fetch(url)
    .then(res => res.json())
    .then(json => {
      datos = json.Listado;
      render();
    }).catch(err => {
      document.getElementById('tabla-licitaciones').innerHTML = `
        <div class="alert alert-danger">No se pudo cargar el archivo data.json.<br>
        <small>${err}</small></div>`;
    });

  document.getElementById('busqueda').addEventListener('input', e => {
    filtro = e.target.value.toLowerCase();
    paginaActual = 1;
    render();
  });

  document.getElementById('fechaDesde').addEventListener('change', e => {
    fechaDesde = e.target.value;
    paginaActual = 1;
    render();
  });

  document.getElementById('fechaHasta').addEventListener('change', e => {
    fechaHasta = e.target.value;
    paginaActual = 1;
    render();
  });

  document.getElementById('estadoFiltro').addEventListener('change', e => {
    estadoFiltro = e.target.value;
    paginaActual = 1;
    render();
  });

  document.getElementById('limpiarFiltros').addEventListener('click', () => {
    filtro = '';
    fechaDesde = '';
    fechaHasta = '';
    estadoFiltro = '';
    document.getElementById('busqueda').value = '';
    document.getElementById('fechaDesde').value = '';
    document.getElementById('fechaHasta').value = '';
    document.getElementById('estadoFiltro').value = '';
    paginaActual = 1;
    render();
  });

  document.getElementById('exportarExcel').addEventListener('click', exportarExcel);
});

function getFiltrados() {
  return datos.filter(l => {
    let coincide = l.Nombre.toLowerCase().includes(filtro) ||
                   l.CodigoExterno.toLowerCase().includes(filtro);

    let fechaLic = l.FechaCierre.slice(0,10); // yyyy-mm-dd
    if (fechaDesde && fechaLic < fechaDesde) return false;
    if (fechaHasta && fechaLic > fechaHasta) return false;

    if (estadoFiltro && estadoFiltro !== "") {
      if (estadoFiltro === "otro" && l.CodigoEstado == 5) return false;
      if (estadoFiltro !== "otro" && String(l.CodigoEstado) !== estadoFiltro) return false;
    }

    return coincide;
  });
}

function render() {
  let filtrados = getFiltrados();
  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const inicio = (paginaActual - 1) * porPagina;
  const pagina = filtrados.slice(inicio, inicio + porPagina);

  // Render tabla
  let html = `<table class="table table-bordered table-striped align-middle">
    <thead class="table-primary">
      <tr>
        <th>Código</th>
        <th>Nombre</th>
        <th>Estado</th>
        <th>Fecha Cierre</th>
        <th>Detalle</th>
      </tr>
    </thead>
    <tbody>
      ${pagina.map(l => `
        <tr>
          <td>${l.CodigoExterno}</td>
          <td>${l.Nombre}</td>
          <td>${estadoTexto(l.CodigoEstado)}</td>
          <td>${formateaFecha(l.FechaCierre)}</td>
          <td>
            <button class="btn btn-primary flex-fill" onclick="verDetalle('${l.CodigoExterno.replace(/'/g, "\\'")}')">Ver detalle</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="text-end small text-muted">
    Mostrando ${filtrados.length === 0 ? 0 : (inicio + 1)} a ${inicio + pagina.length} de ${filtrados.length} resultados
  </div>
  `;
  document.getElementById('tabla-licitaciones').innerHTML = html;

  // Render paginación
  let pagHtml = '';
  if (totalPaginas > 1) {
    pagHtml += `
      <li class="page-item${paginaActual === 1 ? ' disabled' : ''}">
        <button class="page-link" onclick="cambiarPagina(${paginaActual - 1})">&laquo;</button>
      </li>`;
    for (let i = 1; i <= totalPaginas; i++) {
      if (i === 1 || i === totalPaginas || Math.abs(i - paginaActual) <= 2) {
        pagHtml += `<li class="page-item${i === paginaActual ? ' active' : ''}">
          <button class="page-link" onclick="cambiarPagina(${i})">${i}</button>
        </li>`;
      } else if (i === paginaActual - 3 || i === paginaActual + 3) {
        pagHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
    }
    pagHtml += `
      <li class="page-item${paginaActual === totalPaginas ? ' disabled' : ''}">
        <button class="page-link" onclick="cambiarPagina(${paginaActual + 1})">&raquo;</button>
      </li>`;
  }
  document.getElementById('paginacion').innerHTML = pagHtml;
}

function formateaFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Puedes personalizar los estados según tu sistema
function estadoTexto(codigo) {
  switch (codigo) {
    case 5: return "Publicada";
    default: return "Otro";
  }
}

window.cambiarPagina = function(n) {
  paginaActual = n;
  render();
}

// Modal detalle dinámico
window.verDetalle = function(codigo) {
  const lic = datos.find(l => l.CodigoExterno === codigo);
  if (!lic) return;
  let contenido = `<ul class="list-group">`;
  for (const key in lic) {
    contenido += `<li class="list-group-item"><b>${key}:</b> ${lic[key]}</li>`;
  }
  contenido += `</ul>`;
  document.getElementById('detalleContenido').innerHTML = contenido;
  let modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
  modal.show();
}

// Exportar Excel usando SheetJS
function exportarExcel() {
  let filtrados = getFiltrados();
  if (filtrados.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }
  // Solo exporta los campos visibles + detalle
  let datosExportar = filtrados.map(l => ({
    'Código': l.CodigoExterno,
    'Nombre': l.Nombre,
    'Estado': estadoTexto(l.CodigoEstado),
    'Fecha Cierre': formateaFecha(l.FechaCierre)
  }));
  let ws = XLSX.utils.json_to_sheet(datosExportar);
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Licitaciones");
  XLSX.writeFile(wb, "licitaciones.xlsx");
}

// Inyectar footer desde footer.html
document.addEventListener('DOMContentLoaded', () => {
  fetch('footer.html')
    .then(resp => resp.text())
    .then(html => {
      document.getElementById('footer-container').innerHTML = html;
    });
});
