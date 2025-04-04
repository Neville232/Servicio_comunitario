// Manejo del formulario de registro
if (document.getElementById('registroForm')) {
    document.getElementById('tipo_de_usuario').addEventListener('change', (event) => {
        const tipo = event.target.value;
        const camposAdicionales = document.getElementById('camposAdicionales');
        camposAdicionales.innerHTML = ''; // Limpiar campos adicionales

        if (tipo === 'alumno') {
            camposAdicionales.innerHTML = `
                <label for="nombres">Nombres:</label>
                <input type="text" id="nombres" name="nombres" required>

                <label for="apellidos">Apellidos:</label>
                <input type="text" id="apellidos" name="apellidos" required>

                <label for="expediente">Expediente:</label>
                <input type="number" id="expediente" name="expediente" required>

                <label for="cedula">Cédula:</label>
                <input type="number" id="cedula" name="cedula" required>

                <label for="telefono">Teléfono:</label>
                <input type="text" id="telefono" name="telefono" pattern="^\\d{11}$" title="El teléfono debe tener 11 dígitos" required>

                <label for="correo">Correo:</label>
                <input type="email" id="correo" name="correo" required>

                <label for="direccion">Dirección:</label>
                <input type="text" id="direccion" name="direccion" required>

                <label for="semestre">Semestre:</label>
                <input type="number" id="semestre" name="semestre" required>

                <label for="carrera">Carrera:</label>
                <input type="text" id="carrera" name="carrera" required>
            `;
        } else if (tipo === 'empleado') {
            camposAdicionales.innerHTML = `
                <label for="nombres">Nombres:</label>
                <input type="text" id="nombres" name="nombres" required>

                <label for="apellidos">Apellidos:</label>
                <input type="text" id="apellidos" name="apellidos" required>

                <label for="cedula">Cédula:</label>
                <input type="number" id="cedula" name="cedula" required>

                <label for="telefono">Teléfono:</label>
                <input type="text" id="telefono" name="telefono" pattern="^\\d{11}$" title="El teléfono debe tener 11 dígitos" required>

                <label for="correo">Correo:</label>
                <input type="email" id="correo" name="correo" required>

                <label for="direccion">Dirección:</label>
                <input type="text" id="direccion" name="direccion" required>

                <label for="cargo">Cargo:</label>
                <input type="text" id="cargo" name="cargo" required>
            `;
        }
    });

    document.getElementById('registroForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        // Depurar: Verificar los datos enviados al servidor
        console.log('Datos enviados al servidor (registro):', data);

        try {
            const response = await fetch('/registro', {
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