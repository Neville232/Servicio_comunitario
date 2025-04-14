document.getElementById('registroLibroForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que el formulario recargue la página

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/registrar-libro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        const resultadoDiv = document.getElementById('resultado');

        if (response.ok) {
            resultadoDiv.innerHTML = `<p style="color: green;">${result.message}</p>`;
        } else {
            resultadoDiv.innerHTML = `<p style="color: red;">${result.error}</p>`;
        }
    } catch (error) {
        console.error('Error al registrar libro:', error);
        document.getElementById('resultado').innerHTML = `<p style="color: red;">Error al conectar con el servidor.</p>`;
    }
});