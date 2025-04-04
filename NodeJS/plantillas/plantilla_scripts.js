// Esperar a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {
    // Obtener referencias a los elementos del formulario y la lista de mensajes
    const form = document.getElementById("formulario"); // Formulario para enviar datos
    const mensajes = document.getElementById("mensajes"); // Lista donde se mostrarán los mensajes

    // Establecer una conexión con el servidor WebSocket
    const ws = new WebSocket("ws://localhost:8080");

    // Evento que se ejecuta cuando se recibe un mensaje del servidor WebSocket
    ws.onmessage = (event) => {
        // Parsear el mensaje recibido como JSON
        const data = JSON.parse(event.data);

        // Crear un nuevo elemento <li> para mostrar el mensaje
        const li = document.createElement("li");
        li.textContent = `${data.nombre}: ${data.mensaje}`; // Mostrar el nombre y el mensaje
        mensajes.appendChild(li); // Agregar el mensaje a la lista
    };

    // Evento que se ejecuta cuando se envía el formulario
    form.addEventListener("submit", async (event) => {
        // Prevenir el comportamiento predeterminado del formulario (recargar la página)
        event.preventDefault();

        // Obtener los valores de los campos del formulario
        const nombre = document.getElementById("nombre").value; // Campo "nombre"
        const email = document.getElementById("email").value; // Campo "email"
        const mensaje = document.getElementById("mensaje").value; // Campo "mensaje"

        // Enviar los datos al servidor mediante una solicitud POST
        const response = await fetch("/crear", {
            method: "POST", // Método HTTP
            headers: { "Content-Type": "application/json" }, // Indicar que se envía JSON
            body: JSON.stringify({ nombre, email, mensaje }) // Convertir los datos a JSON
        });

        // Si la solicitud fue exitosa, limpiar el formulario
        if (response.ok) {
            form.reset(); // Reiniciar los campos del formulario
        }
    });

    // Función para obtener todos los registros de la base de datos
    async function obtenerRegistros() {
        try {
            const response = await fetch("/formularios"); // Solicitud GET al servidor
            const registros = await response.json(); // Parsear la respuesta como JSON

            // Limpiar la lista de mensajes antes de agregar los registros
            mensajes.innerHTML = "";

            // Mostrar cada registro en la lista
            registros.forEach((registro) => {
                const li = document.createElement("li");
                li.textContent = `${registro.nombre}: ${registro.mensaje}`;

                // Agregar botones para editar y eliminar
                const editarBtn = document.createElement("button");
                editarBtn.textContent = "Editar";
                editarBtn.addEventListener("click", () => editarRegistro(registro.id));

                const eliminarBtn = document.createElement("button");
                eliminarBtn.textContent = "Eliminar";
                eliminarBtn.addEventListener("click", () => eliminarRegistro(registro.id));

                li.appendChild(editarBtn);
                li.appendChild(eliminarBtn);
                mensajes.appendChild(li);
            });
        } catch (error) {
            console.error("Error al obtener los registros:", error);
        }
    }

    // Función para editar un registro
    async function editarRegistro(id) {
        const nuevoNombre = prompt("Ingrese el nuevo nombre:");
        const nuevoEmail = prompt("Ingrese el nuevo email:");
        const nuevoMensaje = prompt("Ingrese el nuevo mensaje:");

        if (nuevoNombre && nuevoEmail && nuevoMensaje) {
            try {
                const response = await fetch(`/actualizar/${id}`, {
                    method: "PUT", // Método HTTP PUT para actualizar
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nombre: nuevoNombre,
                        email: nuevoEmail,
                        mensaje: nuevoMensaje,
                    }),
                });

                if (response.ok) {
                    console.log("Registro actualizado correctamente");
                    obtenerRegistros(); // Actualizar la lista de registros
                }
            } catch (error) {
                console.error("Error al actualizar el registro:", error);
            }
        }
    }

    // Función para eliminar un registro
    async function eliminarRegistro(id) {
        if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
            try {
                const response = await fetch(`/eliminar/${id}`, {
                    method: "DELETE", // Método HTTP DELETE para eliminar
                });

                if (response.ok) {
                    console.log("Registro eliminado correctamente");
                    obtenerRegistros(); // Actualizar la lista de registros
                }
            } catch (error) {
                console.error("Error al eliminar el registro:", error);
            }
        }
    }

    // Llamar a la función para obtener los registros al cargar la página
    obtenerRegistros();
});  