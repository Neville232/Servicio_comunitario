const socket = io();

// Configurar la fecha de préstamo como la fecha actual
document.addEventListener('DOMContentLoaded', () => {
    const fechaPrestamoInput = document.getElementById('fechaPrestamo');
    const hoy = new Date();
    const fechaActual = hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    fechaPrestamoInput.value = fechaActual; // Establecer la fecha actual
});

// Función para actualizar los datos del estudiante en el contenedor
function actualizarDatosEstudiante(datos) {
    document.getElementById('alumnosId').textContent = datos.alumnos_id || '-';
    document.getElementById('nombreEstudiante').textContent = datos.nombres || '-';
    document.getElementById('apellidosEstudiante').textContent = datos.apellidos || '-';
    document.getElementById('cedulaEstudiante').textContent = datos.cedula || '-';
    document.getElementById('expedienteEstudiante').textContent = datos.expediente || '-';
    document.getElementById('telefonoEstudiante').textContent = datos.telefono || '-';
    document.getElementById('correoEstudiante').textContent = datos.correo || '-';
    document.getElementById('carreraEstudiante').textContent = datos.carrera || '-';
    document.getElementById('semestreEstudiante').textContent = datos.semestre || '-';
}

// Función para actualizar los datos del libro en el contenedor
function actualizarDatosLibro(datos) {
    document.getElementById('librosId').textContent = datos.libros_id || '-';
    document.getElementById('tituloLibro').textContent = datos.titulo || '-';
    document.getElementById('autorLibro').textContent = datos.autor || '-';
    document.getElementById('materiaLibro').textContent = datos.materia || '-';
    document.getElementById('edicionLibro').textContent = datos.edicion || '-';
    document.getElementById('cotaLibro').textContent = datos.cota || '-';
    document.getElementById('ejemplarLibro').textContent = datos.ejemplar || '-';
    document.getElementById('disponibilidadLibro').textContent = datos.disponibilidad || '-';
}

// Validar y emitir evento para RFID
document.getElementById('rfid').addEventListener('input', function () {
    const rfid = this.value.trim();
    if (rfid.length === 10) {
        socket.emit('obtener-datos-estudiante', { rfid });
    }
});

// Validar y emitir evento para Expediente
document.getElementById('expediente').addEventListener('input', function () {
    const expediente = this.value.trim();
    if (expediente.length === 10) {
        socket.emit('obtener-datos-estudiante', { expediente });
    }
});

// Escuchar los datos del estudiante desde el servidor
socket.on('datos-estudiante', (datos) => {
    actualizarDatosEstudiante(datos);
});

// Manejar errores al obtener los datos del estudiante
socket.on('error-datos-estudiante', (error) => {
    console.error(error.error);
    actualizarDatosEstudiante({}); // Limpiar los datos del estudiante
});


// Mostrar u ocultar campos según el método de registro seleccionado
document.getElementById('metodoRegistro').addEventListener('change', function () {
    const metodo = this.value;
    const rfidSection = document.getElementById('rfidSection');
    const expedienteSection = document.getElementById('expedienteSection');

    if (metodo === 'rfid') {
        rfidSection.style.display = 'block';
        expedienteSection.style.display = 'none';
    } else if (metodo === 'expediente') {
        rfidSection.style.display = 'none';
        expedienteSection.style.display = 'block';
    } else {
        rfidSection.style.display = 'none';
        expedienteSection.style.display = 'none';
    }
});


// Validar y emitir evento para Cota y Ejemplar
document.getElementById('cota').addEventListener('input', function () {
    const cota = this.value.trim();
    const ejemplar = document.getElementById('ejemplar').value.trim();

    if (cota && ejemplar) {
        socket.emit('obtener-datos-libro', { cota, ejemplar });
    }
});

document.getElementById('ejemplar').addEventListener('input', function () {
    const ejemplar = this.value.trim();
    const cota = document.getElementById('cota').value.trim();

    if (cota && ejemplar) {
        socket.emit('obtener-datos-libro', { cota, ejemplar });
    }
});

// Escuchar los datos del libro desde el servidor
socket.on('datos-libro', (datos) => {
    actualizarDatosLibro(datos);
});

// Manejar errores al obtener los datos del libro
socket.on('error-datos-libro', (error) => {
    console.error(error.error);
    actualizarDatosLibro({}); // Limpiar los datos del libro
});

document.getElementById('registroPrestamoForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Formulario enviado'); // Depuración

    const alumnos_id = document.getElementById('alumnosId').textContent.trim();
    const libros_id = document.getElementById('librosId').textContent.trim();
    const fecha_retiro = document.getElementById('fechaPrestamo').value;
    const fecha_entrega = document.getElementById('fechaDevolucion').value;

    console.log({ alumnos_id, libros_id, fecha_retiro, fecha_entrega }); // Depuración

    if (!alumnos_id || !libros_id || !fecha_retiro || !fecha_entrega) {
        alert('Todos los campos son obligatorios.');
        return;
    }

    try {
        const response = await fetch('/registrar-prestamo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alumnos_id, libros_id, fecha_retiro, fecha_entrega }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            document.getElementById('disponibilidadLibro').textContent = 'No Disponible';
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error al registrar el préstamo:', error);
        alert('Error al registrar el préstamo. Intente nuevamente.');
    }
});