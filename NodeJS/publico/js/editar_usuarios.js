if (document.getElementById('editarUsuarioForm')) {
    // Manejar el cambio del tipo de usuario
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

                <label for="rfid">RFID:</label>
                <input type="number" id="rfid" name="rfid" required>

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
                    <option value="Ingeniería mecatrónica">Ingeniería mecatrónica</option>
                    <option value="Ingeniería en equipos ferroviarios">Ingeniería en equipos ferroviarios</option>
                    <option value="TSU en construcción civil">TSU en construcción civil</option>
                    <option value="TSU en electricidad">TSU en electricidad</option>
                    <option value="TSU en mecánica">TSU en mecánica</option>
                </select>
            `;
        } else if (tipo === 'empleado') {
            camposAdicionales.innerHTML = `
                <label for="nombres">Nombres:</label>
                <input type="text" id="nombres" name="nombres" required>

                <label for="apellidos">Apellidos:</label>
                <input type="text" id="apellidos" name="apellidos" required>

                <label for="rfid">RFID:</label>
                <input type="number" id="rfid" name="rfid" required>

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

    // Manejar la consulta de datos
    document.getElementById('consultarBtn').addEventListener('click', async () => {
        const cedula = document.getElementById('cedula').value;

        if (!cedula) {
            alert('Por favor, ingrese la Cédula para consultar.');
            return;
        }

        try {
            const response = await fetch(`/consultar-usuario?cedula=${cedula}`);
            const data = await response.json();

            if (response.ok) {
                // Llenar los campos con los datos obtenidos
                document.getElementById('nombres').value = data.nombres || '';
                document.getElementById('apellidos').value = data.apellidos || '';
                document.getElementById('rfid').value = data.rfid || '';
                document.getElementById('telefono').value = data.telefono || '';
                document.getElementById('correo').value = data.correo || '';
                document.getElementById('direccion').value = data.direccion || '';

                if (data.tipo_de_usuario === 'alumno') {
                    document.getElementById('expediente').value = data.expediente || '';
                    document.getElementById('semestre').value = data.semestre || '';
                    document.getElementById('carrera').value = data.carrera || '';
                } else if (data.tipo_de_usuario === 'empleado') {
                    document.getElementById('cargo').value = data.cargo || '';
                }
            } else {
                alert(data.error || 'No se encontraron datos para el usuario.');
            }
        } catch (error) {
            console.error('Error al consultar usuario:', error);
            alert('Error al conectar con el servidor.');
        }
    });

    // Manejar el envío del formulario para guardar cambios
    document.getElementById('editarUsuarioForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        const cedula = document.getElementById('cedula').value;

        try {
            const response = await fetch(`/editar-usuario/${cedula}`, {
                method: 'PUT',
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
            console.error('Error al editar usuario:', error);
            document.getElementById('resultado').innerHTML = `<p style="color: red;">Error al conectar con el servidor.</p>`;
        }
    });
}