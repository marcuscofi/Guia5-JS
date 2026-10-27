// =============================================================
// pedidos.js - Gestión de pedidos de una cafetería
// Estructura:
//   1) Estado
//   2) Lógica de datos (funciones puras, sin tocar el DOM)
//   3) Actualización del DOM
//   4) Manejadores de eventos
// =============================================================

/* ---------------------------- 1) ESTADO ---------------------------- */
const pedidos = [];          // arreglo de objetos { producto, precio, cantidad }
let precioMaximoActivo = null; // null = sin filtro; número = filtro activo

/* ------------------- 2) LÓGICA DE DATOS (sin DOM) ------------------- */

// Valida los datos del formulario y devuelve un objeto con los errores encontrados
const validarPedido = ({ producto, precio, cantidad }) => {
  const errores = {};
  if (producto.trim() === "") {
    errores.producto = "Escriba el nombre del producto.";
  }
  if (!Number.isFinite(precio) || precio <= 0) {
    errores.precio = "El precio debe ser un número mayor que cero.";
  }
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    errores.cantidad = "La cantidad debe ser un número entero positivo.";
  }
  return errores;
};

const crearPedido = ({ producto, precio, cantidad }) => ({
  producto: producto.trim(),
  precio,
  cantidad,
});

const calcularSubtotal = ({ precio, cantidad }) => precio * cantidad;

// filter() devuelve un arreglo nuevo: el arreglo original no se modifica
const filtrarPorPrecioMaximo = (lista, maximo) =>
  maximo === null ? [...lista] : lista.filter((pedido) => pedido.precio <= maximo);

// map() agrega el subtotal a cada pedido (sin alterar los objetos originales)
const agregarSubtotales = (lista) =>
  lista.map((pedido) => ({ ...pedido, subtotal: calcularSubtotal(pedido) }));

// reduce() para acumular unidades y monto
const calcularTotalUnidades = (lista) =>
  lista.reduce((acumulado, pedido) => acumulado + pedido.cantidad, 0);

const calcularMontoTotal = (lista) =>
  lista.reduce((acumulado, pedido) => acumulado + calcularSubtotal(pedido), 0);

const formatearMoneda = (valor) => valor.toFixed(2);

// Evita que el texto escrito por el usuario se interprete como HTML
const escaparHTML = (texto) =>
  texto.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

/* ----------------------- 3) ACTUALIZACIÓN DEL DOM ---------------------- */
const formPedido = document.querySelector("#formPedido");
const inputProducto = document.querySelector("#inputProducto");
const inputPrecio = document.querySelector("#inputPrecio");
const inputCantidad = document.querySelector("#inputCantidad");
const inputPrecioMax = document.querySelector("#inputPrecioMax");
const cuerpoTabla = document.querySelector("#cuerpoTabla");
const spanTotalUnidades = document.querySelector("#totalUnidades");
const spanMontoTotal = document.querySelector("#montoTotal");
const estadoFiltro = document.querySelector("#estadoFiltro");

const campos = [
  { clave: "producto", input: inputProducto, error: document.querySelector("#errorProducto") },
  { clave: "precio", input: inputPrecio, error: document.querySelector("#errorPrecio") },
  { clave: "cantidad", input: inputCantidad, error: document.querySelector("#errorCantidad") },
];

const mostrarErrores = (errores) => {
  campos.forEach(({ clave, input, error }) => {
    const mensaje = errores[clave];
    input.classList.toggle("is-invalid", Boolean(mensaje));
    error.textContent = mensaje ?? "";
  });
};

const renderTabla = (lista) => {
  cuerpoTabla.innerHTML =
    lista.length === 0
      ? `<tr><td colspan="4" class="text-center text-muted">No hay pedidos para mostrar.</td></tr>`
      : agregarSubtotales(lista)
          .map(
            (fila) => `
              <tr>
                <td>${escaparHTML(fila.producto)}</td>
                <td class="text-end">$${formatearMoneda(fila.precio)}</td>
                <td class="text-end">${fila.cantidad}</td>
                <td class="text-end">$${formatearMoneda(fila.subtotal)}</td>
              </tr>`
          )
          .join("");
};

const renderTotales = (lista) => {
  spanTotalUnidades.textContent = calcularTotalUnidades(lista);
  spanMontoTotal.textContent = formatearMoneda(calcularMontoTotal(lista));
};

const renderEstadoFiltro = (visibles) => {
  estadoFiltro.textContent =
    precioMaximoActivo === null
      ? `Mostrando todos los pedidos (${pedidos.length}).`
      : `Filtro activo: precio unitario ≤ $${formatearMoneda(precioMaximoActivo)}. Mostrando ${visibles.length} de ${pedidos.length} pedidos.`;
};

// Función central: recalcula lo que se debe ver y actualiza todo el DOM
const actualizarVista = () => {
  const visibles = filtrarPorPrecioMaximo(pedidos, precioMaximoActivo);
  renderTabla(visibles);
  renderTotales(visibles); // los totales corresponden a los pedidos mostrados en la tabla
  renderEstadoFiltro(visibles);
};

/* ------------------------ 4) MANEJADORES DE EVENTOS ------------------------ */
const agregarPedido = () => {
  const datos = {
    producto: inputProducto.value,
    precio: Number(inputPrecio.value),     // "" -> 0, "abc" -> NaN: ambos se rechazan
    cantidad: Number(inputCantidad.value), // "2.5" no es entero: se rechaza
  };

  const errores = validarPedido(datos);
  mostrarErrores(errores);
  if (Object.keys(errores).length > 0) return;

  pedidos.push(crearPedido(datos));
  formPedido.reset();
  inputProducto.focus();
  actualizarVista();
};

const filtrarProductos = () => {
  const texto = inputPrecioMax.value.trim();
  const maximo = Number(texto);
  const valido = texto !== "" && Number.isFinite(maximo) && maximo >= 0;

  inputPrecioMax.classList.toggle("is-invalid", !valido);
  if (!valido) return;

  precioMaximoActivo = maximo;
  actualizarVista();
};

const mostrarTodos = () => {
  precioMaximoActivo = null;
  inputPrecioMax.value = "";
  inputPrecioMax.classList.remove("is-invalid");
  actualizarVista();
};

const limpiarPedidos = () => {
  pedidos.length = 0; // vacía el arreglo conservando la referencia
  actualizarVista();
};

document.querySelector("#btnAgregar").addEventListener("click", agregarPedido);
document.querySelector("#btnFiltrar").addEventListener("click", filtrarProductos);
document.querySelector("#btnMostrarTodos").addEventListener("click", mostrarTodos);
document.querySelector("#btnLimpiar").addEventListener("click", limpiarPedidos);

// Permite registrar el pedido también con la tecla Enter dentro del formulario
formPedido.addEventListener("submit", (evento) => {
  evento.preventDefault();
  agregarPedido();
});

actualizarVista(); // estado inicial (tabla vacía y totales en cero)
