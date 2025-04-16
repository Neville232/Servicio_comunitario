// Función para cargar los préstamos desde el backend
async function cargarPrestamos() {
    try {
        // Realizar la solicitud al backend
        const response = await fetch('/prestamos');
        const prestamos = await response.json();

        // Seleccionar el contenedor de las cards
        const cardContainer = document.querySelector('.card-container');
        cardContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar las cards

        // Generar una card por cada préstamo
        prestamos.forEach(prestamo => {
            const card = document.createElement('div');
            card.classList.add('card');

            // Formatear las fechas
            const fechaRetiro = new Date(prestamo.fecha_retiro).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
            const fechaEntrega = new Date(prestamo.fecha_entrega).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });

            // Crear el contenido de la card
            card.innerHTML = `
                <h2>Alumno: ${prestamo.alumno_nombre} ${prestamo.alumno_apellido}</h2>
                <p><strong>Expediente:</strong> ${prestamo.alumno_expediente}</p>
                <p><strong>Teléfono:</strong> ${prestamo.alumno_telefono}</p>
                <p><strong>Correo:</strong> ${prestamo.alumno_correo}</p>
                <p><strong>Semestre:</strong> ${prestamo.alumno_semestre}</p>
                <p><strong>Libro:</strong> ${prestamo.libro_titulo}</p>
                <p><strong>Autores:</strong> ${prestamo.libro_autores}</p>
                <p><strong>Cota:</strong> ${prestamo.libro_cota}</p>
                <p><strong>Ejemplar:</strong> ${prestamo.libro_ejemplar}</p>
                <p><strong>Fecha de Préstamo:</strong> ${fechaRetiro}</p>
                <p><strong>Fecha de Devolución:</strong> ${fechaEntrega}</p>
            `;

            cardContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar los préstamos:', error);
    }
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', cargarPrestamos);


// Función para eliminar tildes y normalizar texto
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Elimina los acentos
}

// Función para filtrar las cards
document.getElementById('searchBar').addEventListener('input', function () {
    const searchTerm = normalizeText(this.value);
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const alumno = normalizeText(card.querySelector('h2').textContent);
        const rfid = normalizeText(card.querySelector('p:nth-of-type(1)').textContent);
        const expediente = normalizeText(card.querySelector('p:nth-of-type(2)').textContent);
        const libro = normalizeText(card.querySelector('p:nth-of-type(3)').textContent);

        if (alumno.includes(searchTerm) || rfid.includes(searchTerm) || expediente.includes(searchTerm) || libro.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});