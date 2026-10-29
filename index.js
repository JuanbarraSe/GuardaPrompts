const STORAGE_KEY = "sena_prompts_data";

const datosPorDefecto = {
  cajas: [
    {
      id: "CJ-01",
      nombre: "Programación Web",
      descripcion: "Prompts para formación técnica en desarrollo de software"
    }
  ],
  prompts: [
    {
      id: "PRM-01",
      cajaId: "CJ-01",
      titulo: "Explicar ciclo For en JavaScript",
      contenido: "Actúa como instructor del SENA. Explica el funcionamiento de un ciclo 'for' en JavaScript usando una analogía sencilla de la vida real.",
      conexionId: ""
    }
  ]
};

let datos = cargarDatos();

function cargarDatos() {
  const guardado = localStorage.getItem(STORAGE_KEY);
  if (guardado) {
    try {
      return JSON.parse(guardado);
    } catch (e) {
      console.error("Error al leer datos guardados:", e);
    }
  }
  return datosPorDefecto;
}

function guardarDatos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  renderizar();
}


function esAlfanumerico(texto) {
  const patron = /^[a-zA-Z0-9\-_]+$/;
  return patron.test(texto);
}
const formCaja = document.getElementById("formCaja");
const formPrompt = document.getElementById("formPrompt");
const cajaDestinoSelect = document.getElementById("cajaDestino");
const conectarConSelect = document.getElementById("conectarCon");
const contenedorCajas = document.getElementById("contenedorCajas");
const inputBuscar = document.getElementById("inputBuscar");
const sinResultados = document.getElementById("sinResultados");

const contadorCajas = document.getElementById("contadorCajas");
const contadorPrompts = document.getElementById("contadorPrompts");
const contadorConexiones = document.getElementById("contadorConexiones");


const editandoId = document.getElementById("editandoId");
const codigoPromptInput = document.getElementById("codigoPrompt");
const indicadorEdicion = document.getElementById("indicadorEdicion");
const btnGuardarPrompt = document.getElementById("btnGuardarPrompt");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");

formCaja.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("codigoCaja").value.trim().toUpperCase();
  const nombre = document.getElementById("nombreCaja").value.trim();
  const descripcion = document.getElementById("descripcionCaja").value.trim();

  if (!esAlfanumerico(id)) {
    alert("El código de la caja debe ser alfanumérico (solo letras, números o guiones).");
    return;
  }

  if (datos.cajas.some(c => c.id === id)) {
    alert("Ya existe una caja con el código [" + id + "]. Elige otro diferente.");
    return;
  }

  datos.cajas.push({ id, nombre, descripcion });
  guardarDatos();
  formCaja.reset();
  alert("Caja [" + id + "] creada exitosamente.");
});

formPrompt.addEventListener("submit", (e) => {
  e.preventDefault();

  const idEditando = editandoId.value;
  const id = codigoPromptInput.value.trim().toUpperCase();
  const cajaId = cajaDestinoSelect.value;
  const titulo = document.getElementById("tituloPrompt").value.trim();
  const conexionId = conectarConSelect.value;
  const contenido = document.getElementById("contenidoPrompt").value.trim();

  if (!esAlfanumerico(id)) {
    alert("El código del prompt debe ser alfanumérico (solo letras, números o guiones).");
    return;
  }

  if (idEditando !== "") {
    const promptExistente = datos.prompts.find(p => p.id === idEditando);
    if (promptExistente) {
      promptExistente.cajaId = cajaId;
      promptExistente.titulo = titulo;
      promptExistente.conexionId = conexionId;
      promptExistente.contenido = contenido;

      guardarDatos();
      cancelarEdicionPrompt();
      alert("Prompt [" + idEditando + "] actualizado exitosamente.");
    }
    return;
  }

  if (datos.prompts.some(p => p.id === id)) {
    alert("Ya existe un prompt con el código [" + id + "]. Ingresa un código único.");
    return;
  }

  datos.prompts.push({
    id,
    cajaId,
    titulo,
    contenido,
    conexionId
  });

  guardarDatos();
  formPrompt.reset();
  alert("Prompt [" + id + "] almacenado exitosamente.");
});

btnCancelarEdicion.addEventListener("click", () => {
  cancelarEdicionPrompt();
});

inputBuscar.addEventListener("input", () => {
  renderizar();
});

function cargarParaEditar(id) {
  const p = datos.prompts.find(item => item.id === id);
  if (!p) return;

  editandoId.value = p.id;
  codigoPromptInput.value = p.id;
  codigoPromptInput.disabled = true;
  cajaDestinoSelect.value = p.cajaId;
  document.getElementById("tituloPrompt").value = p.titulo;
  conectarConSelect.value = p.conexionId;
  document.getElementById("contenidoPrompt").value = p.contenido;

  indicadorEdicion.style.display = "inline-block";
  btnGuardarPrompt.textContent = "Actualizar Prompt";
  btnCancelarEdicion.style.display = "inline-block";

  formPrompt.scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicionPrompt() {
  editandoId.value = "";
  codigoPromptInput.disabled = false;
  formPrompt.reset();
  indicadorEdicion.style.display = "none";
  btnGuardarPrompt.textContent = "+ Guardar Prompt";
  btnCancelarEdicion.style.display = "none";
}

function eliminarPrompt(id) {
  if (confirm("¿Deseas eliminar el prompt [" + id + "]?")) {
    datos.prompts = datos.prompts.filter(p => p.id !== id);

    datos.prompts.forEach(p => {
      if (p.conexionId === id) p.conexionId = "";
    });

    if (editandoId.value === id) {
      cancelarEdicionPrompt();
    }

    guardarDatos();
  }
}

function eliminarCaja(cajaId) {
  const cantidad = datos.prompts.filter(p => p.cajaId === cajaId).length;
  const msg = cantidad > 0
    ? `Esta caja contiene ${cantidad} prompt(s). ¿Deseas eliminar la caja y sus prompts?`
    : `¿Deseas eliminar la caja [${cajaId}]?`;

  if (confirm(msg)) {

    datos.cajas = datos.cajas.filter(c => c.id !== cajaId);

    const eliminadosIds = datos.prompts.filter(p => p.cajaId === cajaId).map(p => p.id);
    datos.prompts = datos.prompts.filter(p => p.cajaId !== cajaId);

    datos.prompts.forEach(p => {
      if (eliminadosIds.includes(p.conexionId)) p.conexionId = "";
    });

    guardarDatos();
  }
}

function copiarPrompt(id, boton) {
  const p = datos.prompts.find(item => item.id === id);
  if (!p) return;

  navigator.clipboard.writeText(p.contenido).then(() => {
    const textoOriginal = boton.textContent;
    boton.textContent = "✔ Copiado";
    boton.classList.remove("btn-gris");
    boton.classList.add("btn-principal");

    setTimeout(() => {
      boton.textContent = textoOriginal;
      boton.classList.remove("btn-principal");
      boton.classList.add("btn-gris");
    }, 1500);
  }).catch(() => {
    alert("Contenido del prompt:\n\n" + p.contenido);
  });
}
function renderizar() {
  const filtro = inputBuscar.value.trim().toLowerCase();

  contadorCajas.textContent = datos.cajas.length;
  contadorPrompts.textContent = datos.prompts.length;
  const conexionesActivas = datos.prompts.filter(p => p.conexionId && datos.prompts.some(otro => otro.id === p.conexionId)).length;
  contadorConexiones.textContent = conexionesActivas;


  actualizarDesplegables();


  contenedorCajas.innerHTML = "";

  if (datos.cajas.length === 0) {
    sinResultados.style.display = "block";
    sinResultados.textContent = "No tienes cajas registradas. Crea la primera en el formulario de arriba.";
    return;
  }

  let cajasVisibles = 0;

  datos.cajas.forEach(caja => {
    const promptsDeEstaCaja = datos.prompts.filter(p => p.cajaId === caja.id);

    const promptsFiltrados = promptsDeEstaCaja.filter(p => {
      const conectadoCon = datos.prompts.find(otro => otro.id === p.conexionId);
      const textoConectado = conectadoCon ? conectadoCon.titulo : "";
      return (
        p.id.toLowerCase().includes(filtro) ||
        p.titulo.toLowerCase().includes(filtro) ||
        p.contenido.toLowerCase().includes(filtro) ||
        caja.nombre.toLowerCase().includes(filtro) ||
        caja.id.toLowerCase().includes(filtro) ||
        textoConectado.toLowerCase().includes(filtro)
      );
    });

    const coincideCaja = caja.nombre.toLowerCase().includes(filtro) || caja.id.toLowerCase().includes(filtro);
    const mostrarCaja = coincideCaja || promptsFiltrados.length > 0;

    if (!mostrarCaja && filtro !== "") return;

    cajasVisibles++;


    const cajaDiv = document.createElement("div");
    cajaDiv.className = "tarjeta-caja";

    cajaDiv.innerHTML = `
      <div class="barra-caja">
        <div class="caja-info">
          <span class="badge-codigo">${caja.id}</span>
          <span class="caja-nombre">${caja.nombre}</span>
          ${caja.descripcion ? `<span class="caja-desc">&bull; ${caja.descripcion}</span>` : ""}
        </div>
        <div>
          <button class="btn btn-rojo btn-chico" onclick="eliminarCaja('${caja.id}')">Eliminar Caja</button>
        </div>
      </div>
      <div class="grid-prompts" id="grid-${caja.id}"></div>
    `;

    const grid = cajaDiv.querySelector(`#grid-${caja.id}`);
    const listaPrompts = coincideCaja && filtro !== "" ? promptsDeEstaCaja : (filtro === "" ? promptsDeEstaCaja : promptsFiltrados);

    if (listaPrompts.length === 0) {
      grid.innerHTML = `<p class="caja-vacia">Esta caja no tiene prompts guardados.</p>`;
    } else {
      listaPrompts.forEach(p => {
        const promptConectado = p.conexionId ? datos.prompts.find(otro => otro.id === p.conexionId) : null;

        const card = document.createElement("div");
        card.className = "card-prompt";
        card.innerHTML = `
          <div>
            <div class="prompt-top">
              <span class="badge-codigo badge-prompt">${p.id}</span>
              <span class="prompt-titulo">${p.titulo}</span>
            </div>

            ${promptConectado ? `
              <div class="etiqueta-conexion" title="Enlazado con otro prompt">
                🔗 Conectado con: [${promptConectado.id}] ${promptConectado.titulo}
              </div>
            ` : ""}

            <div class="prompt-cuerpo">${escaparTexto(p.contenido)}</div>
          </div>

          <div class="botones-prompt">
            <button class="btn btn-gris btn-chico" onclick="copiarPrompt('${p.id}', this)">Copiar</button>
            <button class="btn btn-gris btn-chico" onclick="cargarParaEditar('${p.id}')">Editar</button>
            <button class="btn btn-rojo btn-chico" onclick="eliminarPrompt('${p.id}')">Eliminar</button>
          </div>
        `;
        grid.appendChild(card);
      });
    }

    contenedorCajas.appendChild(cajaDiv);
  });

  if (cajasVisibles === 0) {
    sinResultados.style.display = "block";
    sinResultados.textContent = "No se encontraron coincidencias para la búsqueda.";
  } else {
    sinResultados.style.display = "none";
  }
}

function actualizarDesplegables() {
  const seleccionCaja = cajaDestinoSelect.value;
  cajaDestinoSelect.innerHTML = '<option value="">-- Elige una caja --</option>';
  datos.cajas.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `[${c.id}] ${c.nombre}`;
    cajaDestinoSelect.appendChild(opt);
  });
  if (datos.cajas.some(c => c.id === seleccionCaja)) {
    cajaDestinoSelect.value = seleccionCaja;
  }

  const seleccionConexion = conectarConSelect.value;
  const idActual = editandoId.value;
  conectarConSelect.innerHTML = '<option value="">-- Sin conexión --</option>';

  const promptsDisponibles = idActual ? datos.prompts.filter(p => p.id !== idActual) : datos.prompts;

  promptsDisponibles.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `[${p.id}] ${p.titulo}`;
    conectarConSelect.appendChild(opt);
  });
  if (promptsDisponibles.some(p => p.id === seleccionConexion)) {
    conectarConSelect.value = seleccionConexion;
  }
}

function escaparTexto(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

renderizar();