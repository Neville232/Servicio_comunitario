require('dotenv').config();
const express = require('express');
const pool = require('./database');
const cors = require('cors');

const app = express(); // Inicializa la aplicación Express
app.use(express.json()); // Middleware para manejar JSON
app.use(cors()); // Middleware para habilitar CORS

// Servir la carpeta "publico"
app.use(express.static('publico'));

// Validar variables de entorno
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('Error: Variables de entorno no configuradas correctamente.');
    process.exit(1);
}


// Ruta para el login
app.post('/login', async (req, res) => {
    try {
        const { usuario, contrasena } = req.body;

        // Validar que se envíen los datos necesarios
        if (!usuario || !contrasena) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
        }

        // Consultar la base de datos para verificar las credenciales
        const conn = await pool.getConnection();
        const rows = await conn.query(
            "SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?",
            [usuario, contrasena]
        );

        // Verificar si se encontró un usuario
        if (rows.length > 0) {
            const user = rows[0];
            let nombres = '';
            let apellidos = '';

            // Obtener nombres y apellidos dependiendo del tipo de usuario
            if (user.tipo_de_usuario === 'alumno') {
                const alumnoData = await conn.query(
                    "SELECT nombres, apellidos FROM alumnos WHERE usuarios_id = ?",
                    [user.usuarios_id]
                );
                if (alumnoData.length > 0) {
                    nombres = alumnoData[0].nombres;
                    apellidos = alumnoData[0].apellidos;
                }
            } else if (user.tipo_de_usuario === 'empleado') {
                const empleadoData = await conn.query(
                    "SELECT nombres, apellidos FROM empleados WHERE usuarios_id = ?",
                    [user.usuarios_id]
                );
                if (empleadoData.length > 0) {
                    nombres = empleadoData[0].nombres;
                    apellidos = empleadoData[0].apellidos;
                }
            }

            conn.release();

            // Responder con éxito e incluir nombres y apellidos
            res.json({
                success: true,
                message: `Inicio de sesión exitoso. Bienvenido, ${nombres} ${apellidos}.`,
                usuario: {
                    id: user.usuarios_id,
                    tipo_de_usuario: user.tipo_de_usuario,
                    rfid: user.rfid,
                    nombres,
                    apellidos
                }
            });
        } else {
            conn.release();
            res.status(401).json({ success: false, error: 'Credenciales incorrectas.' });
        }
    } catch (err) {
        console.error('Error en el login:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// Ruta para registrar usuarios
app.post('/registro', async (req, res) => {
    const conn = await pool.getConnection(); // Obtener conexión al inicio
    try {
        const {
            usuario, contrasena, rfid, tipo_de_usuario,
            nombres, apellidos, expediente, cedula, telefono, correo, direccion,
            semestre, carrera, cargo
        } = req.body;

        // Validar datos básicos
        if (!usuario || !contrasena || !rfid || !tipo_de_usuario || !nombres || !apellidos || !cedula || !telefono || !correo || !direccion) {
            conn.release();
            return res.status(400).json({ error: 'Todos los campos básicos son requeridos.' });
        }

        // Iniciar transacción
        await conn.beginTransaction();

        // Verificar si el RFID ya existe
        const rfidCheck = await conn.query("SELECT * FROM usuarios WHERE rfid = ?", [rfid]);
        if (rfidCheck.length > 0) {
            conn.release();
            return res.status(400).json({ error: 'El RFID ya está registrado.' });
        }

        // Insertar en la tabla usuarios
        const result = await conn.query(
            "INSERT INTO usuarios (usuario, contrasena, rfid, tipo_de_usuario) VALUES (?, ?, ?, ?)",
            [usuario, contrasena, rfid, tipo_de_usuario]
        );

        const usuarios_id = result.insertId;

        // Insertar en la tabla correspondiente
        if (tipo_de_usuario === 'alumno') {
            if (!expediente || !semestre || !carrera) {
                throw new Error('Expediente, semestre y carrera son requeridos para alumnos.');
            }
            await conn.query(
                "INSERT INTO alumnos (usuarios_id, nombres, apellidos, expediente, cedula, telefono, correo, direccion, semestre, carrera) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [usuarios_id, nombres, apellidos, expediente, cedula, telefono, correo, direccion, semestre, carrera]
            );
        } else if (tipo_de_usuario === 'empleado') {
            if (!cargo) {
                throw new Error('Cargo es requerido para empleados.');
            }
            await conn.query(
                "INSERT INTO empleados (usuarios_id, nombres, apellidos, cedula, telefono, correo, direccion, cargo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [usuarios_id, nombres, apellidos, cedula, telefono, correo, direccion, cargo]
            );
        }

        // Confirmar transacción
        await conn.commit();
        conn.release();
        res.json({ success: true, message: 'Usuario registrado exitosamente.' });
    } catch (err) {
        console.error('Error en el registro:', err.message);
        await conn.rollback(); // Revertir cambios en caso de error
        conn.release();
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// Ruta para consultar usuario por Cédula
app.get('/consultar-usuario', async (req, res) => {
    const { cedula } = req.query;

    if (!cedula) {
        return res.status(400).json({ error: 'Debe proporcionar la Cédula para la consulta.' });
    }

    const conn = await pool.getConnection();
    try {
        // Consulta para buscar en las tablas alumnos y empleados
        const query = `
            SELECT u.*, a.nombres, a.apellidos, a.expediente, a.telefono, a.correo, a.direccion, a.semestre, a.carrera, e.cargo
            FROM usuarios u
            LEFT JOIN alumnos a ON u.usuarios_id = a.usuarios_id
            LEFT JOIN empleados e ON u.usuarios_id = e.usuarios_id
            WHERE a.cedula = ? OR e.cedula = ?`;
        const params = [cedula, cedula];

        // Ejecutar la consulta
        const rows = await conn.query(query, params);

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'No se encontraron datos para el usuario.' });
        }

        conn.release();
        res.json(rows[0]); // Enviar el primer resultado
    } catch (err) {
        console.error('Error al consultar usuario:', err.message);
        conn.release();
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// Ruta para editar usuarios
app.put('/editar-usuario/:cedula', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { cedula } = req.params;
        const {
            nombres, apellidos, expediente, telefono, correo, direccion,
            semestre, carrera, cargo, tipo_de_usuario
        } = req.body;

        // Validar datos básicos
        if (!nombres || !apellidos || !cedula || !telefono || !correo || !direccion) {
            conn.release();
            return res.status(400).json({ error: 'Todos los campos básicos son requeridos.' });
        }

        // Iniciar transacción
        await conn.beginTransaction();

        // Actualizar en la tabla correspondiente
        if (tipo_de_usuario === 'alumno') {
            if (!expediente || !semestre || !carrera) {
                conn.release();
                return res.status(400).json({ error: 'Expediente, semestre y carrera son requeridos para alumnos.' });
            }
            await conn.query(
                "UPDATE alumnos SET nombres = ?, apellidos = ?, expediente = ?, telefono = ?, correo = ?, direccion = ?, semestre = ?, carrera = ? WHERE cedula = ?",
                [nombres, apellidos, expediente, telefono, correo, direccion, semestre, carrera, cedula]
            );
        } else if (tipo_de_usuario === 'empleado') {
            if (!cargo) {
                conn.release();
                return res.status(400).json({ error: 'Cargo es requerido para empleados.' });
            }
            await conn.query(
                "UPDATE empleados SET nombres = ?, apellidos = ?, telefono = ?, correo = ?, direccion = ?, cargo = ? WHERE cedula = ?",
                [nombres, apellidos, telefono, correo, direccion, cargo, cedula]
            );
        } else {
            conn.release();
            return res.status(400).json({ error: 'Tipo de usuario inválido.' });
        }

        // Confirmar transacción
        await conn.commit();
        conn.release();
        res.json({ success: true, message: 'Usuario actualizado exitosamente.' });
    } catch (err) {
        console.error('Error al editar usuario:', err.message);
        await conn.rollback();
        conn.release();
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});