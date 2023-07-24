/* Variables y selectores */
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

/* Eventos */
eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    formulario.addEventListener('submit', agregarGasto);
}

/* Clases */
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.calcularRestante();
    }
}

/* Metodos que imprimen HTML */
class UI {
    insertarPresupuesto(cantidad) {
        /* Extrayendo */
        const { presupuesto, restante } = cantidad;
        /* Agregar HTML */
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo) {
        /* crear el div */
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('alert', 'text-center');

        if(tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        /* Mensaje */
        divMensaje.textContent = mensaje;

        /* Insertar en el HTML */
        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        /* Quitar del HTML */
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    mostrarGastos(gastos) {
        this.limpiarHTML();
        /* Iterar sobre los gastos */
        gastos.forEach(gasto => {
            const { cantidad, nombre, id } = gasto;
            /* Crear LI */
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center'; /* usamos className para muchas clases en lugar de classlist.add(...) */
            nuevoGasto.dataset.id = id; /* equivalente -> setAttribute('data-id', id); */
            /* Agregar el HTML del gasto */
            nuevoGasto.innerHTML = `${nombre} <span class='badge badge-primary badge-pill'>$${cantidad}</span>`;
            /* Boton para borrar el gasto */
            const btnBorrar = document.createElement('button');
            btnBorrar.className = 'btn btn-danger borrar-gasto';
            btnBorrar.innerHTML = 'Borrar &times;';
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);
            /* Agregar al HTML */
            gastoListado.appendChild(nuevoGasto);
        });
    }

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;
        /* Comprobar 25% */
        const restanteDiv = document.querySelector('.restante');
        if((presupuesto / 4) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if ((presupuesto / 2) > restante) {
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        /* Si el total es 0 o menor  */
        if(restante <= 0) {
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        } else {
            formulario.querySelector('button[type="submit"]').disabled = false;
        }
    }

    limpiarHTML() {
        while(gastoListado.firstChild) {
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }
}

/* Instanciar */
const ui = new UI();
let presupuesto;

/* Funciones */
function preguntarPresupuesto() {
    const presupuestoUsuario = prompt('¿Cual es tu presupuesto?');
    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        window.location.reload();
    }

    /* Presupuesto valido */
    presupuesto = new Presupuesto(presupuestoUsuario);
    ui.insertarPresupuesto(presupuesto);
}

function agregarGasto(e) {
    e.preventDefault();

    /* leer los datos del formulario */
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

    /* Validar */
    if(nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return;
    } else if(cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('Cantidad no valida', 'error');
        return;
    }

    /* Generar un objeto con el gasto, esto es lo contrario al destructoring se conoce como mejora del objeto */
    /* Esto es la forma anterior de trabajar con objetos de JS, si llave y valor es lo mismo se puede dejar uno */
    // const gasto = {  
    //     nombre: nombre,
    //     gasto: gasto,
    //     id: Date.now 
    // }
    const gasto = { nombre, cantidad, id: Date.now() }

    /* Añade un nuevo gasto */
    presupuesto.nuevoGasto(gasto);

    /* Mensaje exito */
    ui.imprimirAlerta('Gasto agregado correctamente');

    /* Imprimir los gatos */
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);

    /* Reiniciar formulario */
    formulario.reset();
}

function eliminarGasto(id) {
    /* Elimina del objeto */
    presupuesto.eliminarGasto(id);
    /* Elimina los gastos del HTML */
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}