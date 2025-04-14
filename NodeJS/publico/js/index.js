// Manejo del formulario de login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        // Depurar: Verificar los datos enviados al servidor
        console.log('Datos enviados al servidor (login):', data);

        try {
            const response = await fetch('/login', {
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
            console.error('Error:', error);
            document.getElementById('resultado').innerHTML = `<p style="color: red;">Error al conectar con el servidor.</p>`;
        }
    });
}