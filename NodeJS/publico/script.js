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
                <select id="semestre" name="semestre" required>
                    <option value="">Seleccione...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                </select>

                <label for="carrera">Carrera:</label>
                <select id="carrera" name="carrera" required>
                    <option value="">Seleccione...</option>
                    <option value="Ingeniería Mecatrónica">Ingeniería mecatrónica</option>
                    <option value="Ingeniería en equipos ferroviarios">Ingeniería en equipos ferroviarios</option>
                    <option value="Tecnico en construccion civil">Tecnico en construccion civil</option>
                    <option value="Tecnico en electronica">Tecnico en electronica</option>
                    <option value="Tecnico en mecanica">Tecnico en mecanica</option>
                </select>
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
                <select id="cargo" name="cargo" required>
                    <option value="">Seleccione...</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Profesor">Profesor</option>
                    <option value="Secretario">Secretario</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                </select>
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