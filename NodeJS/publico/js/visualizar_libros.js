// Función para eliminar tildes y normalizar texto
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Elimina los acentos
}

// Función para crear una card de libro
function createBookCard(book) {
    return `
        <div class="card">
            <h2>${book.titulo}</h2>
            <p><strong>Autor:</strong> ${book.autor}</p>
            <p><strong>Materia:</strong> ${book.materia}</p>
            <p><strong>Edición:</strong> ${book.edicion}</p>
            <p><strong>Cota:</strong> ${book.cota}</p>
            <p><strong>Ejemplar:</strong> ${book.ejemplar}</p>
            <p><strong>Disponibilidad:</strong> ${book.disponibilidad}</p>
        </div>
    `;
}

// Función para cargar los libros desde el servidor
async function loadBooks() {
    try {
        const response = await fetch('/libros');
        const books = await response.json();
        
        const cardContainer = document.getElementById('cardContainer');
        cardContainer.innerHTML = '';
        
        books.forEach(book => {
            cardContainer.innerHTML += createBookCard(book);
        });
        
        // Configurar el evento de búsqueda después de cargar los libros
        setupSearch();
    } catch (error) {
        console.error('Error al cargar los libros:', error);
        cardContainer.innerHTML = '<p>Error al cargar los libros. Intente recargar la página.</p>';
    }
}

// Función para configurar la búsqueda
function setupSearch() {
    document.getElementById('searchBar').addEventListener('input', function() {
        const searchTerm = normalizeText(this.value);
        const cards = document.querySelectorAll('.card');

        cards.forEach(card => {
            const title = normalizeText(card.querySelector('h2').textContent);
            const author = normalizeText(card.querySelector('p:nth-of-type(1)').textContent);
            const subject = normalizeText(card.querySelector('p:nth-of-type(2)').textContent);
            const cota = normalizeText(card.querySelector('p:nth-of-type(4)').textContent);

            if (title.includes(searchTerm) || author.includes(searchTerm) || subject.includes(searchTerm) || cota.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Cargar los libros al iniciar la página
document.addEventListener('DOMContentLoaded', loadBooks);

// Opcional: Actualizar los libros periódicamente (cada 3 segundos)
setInterval(loadBooks, 3000);