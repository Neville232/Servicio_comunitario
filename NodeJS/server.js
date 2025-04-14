require('dotenv').config();
const express = require('express');
const pool = require('./database');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express(); // Inicializa la aplicación Express
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middlewares
app.use(express.json()); // Middleware para manejar JSON
app.use(cors()); // Middleware para habilitar CORS
app.use(express.static('publico')); // Servir archivos estáticos

// Validar variables de entorno
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('Error: Variables de entorno no configuradas correctamente.');
    process.exit(1);
}

// Función para notificar cambios en los libros
function notifyBookChanges() {
    io.emit('books_updated');
    console.log('Notificando cambios en los libros a los clientes');
}

// ================== RUTAS DE USUARIOS ================== //

// Ruta para el login
app.post('/login', async (req, res) => {
    try {
        const { usuario, contrasena } = req.body;

        if (!usuario || !contrasena) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
        }

        const conn = await pool.getConnection();
        const rows = await conn.query(
            "SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?",
            [usuario, contrasena]
        );

        if (rows.length > 0) {
            const user = rows[0];
            let nombres = '';
            let apellidos = '';

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
    const conn = await pool.getConnection();
    try {
        const {
            usuario, contrasena, rfid, tipo_de_usuario,
            nombres, apellidos, expediente, cedula, telefono, correo, direccion,
            semestre, carrera, cargo
        } = req.body;

        if (!usuario || !contrasena || !rfid || !tipo_de_usuario || !nombres || !apellidos || !cedula || !telefono || !correo || !direccion) {
            conn.release();
            return res.status(400).json({ error: 'Todos los campos básicos son requeridos.' });
        }

        await conn.beginTransaction();

        const rfidCheck = await conn.query("SELECT * FROM usuarios WHERE rfid = ?", [rfid]);
        if (rfidCheck.length > 0) {
            conn.release();
            return res.status(400).json({ error: 'El RFID ya está registrado.' });
        }

        const result = await conn.query(
            "INSERT INTO usuarios (usuario, contrasena, rfid, tipo_de_usuario) VALUES (?, ?, ?, ?)",
            [usuario, contrasena, rfid, tipo_de_usuario]
        );

        const usuarios_id = result.insertId;

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

        await conn.commit();
        conn.release();
        res.json({ success: true, message: 'Usuario registrado exitosamente.' });
    } catch (err) {
        console.error('Error en el registro:', err.message);
        await conn.rollback();
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
        const query = `
            SELECT u.*, a.nombres, a.apellidos, a.expediente, a.telefono, a.correo, a.direccion, a.semestre, a.carrera, e.cargo
            FROM usuarios u
            LEFT JOIN alumnos a ON u.usuarios_id = a.usuarios_id
            LEFT JOIN empleados e ON u.usuarios_id = e.usuarios_id
            WHERE a.cedula = ? OR e.cedula = ?`;
        const params = [cedula, cedula];

        const rows = await conn.query(query, params);

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'No se encontraron datos para el usuario.' });
        }

        conn.release();
        res.json(rows[0]);
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

        if (!nombres || !apellidos || !cedula || !telefono || !correo || !direccion) {
            conn.release();
            return res.status(400).json({ error: 'Todos los campos básicos son requeridos.' });
        }

        await conn.beginTransaction();

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

// ================== RUTAS DE LIBROS ================== //

// Ruta para registrar un nuevo libro
app.post('/registrar-libro', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { titulo, autores, materia, edicion, cota, ejemplar, disponible } = req.body;

        if (!titulo || !autores || !materia || !edicion || !cota || !ejemplar) {
            conn.release();
            return res.status(400).json({ error: 'Todos los campos son requeridos.' });
        }

        const query = `
            INSERT INTO libros (titulo, autores, materia, edicion, cota, ejemplar, disponible)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [titulo, autores, materia, edicion, cota, ejemplar, disponible || 1];
        await conn.query(query, params);

        conn.release();
        notifyBookChanges(); // Notificar a los clientes sobre el cambio
        res.json({ success: true, message: 'Libro registrado exitosamente.' });
    } catch (err) {
        console.error('Error al registrar libro:', err.message);
        conn.release();
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Ruta para obtener todos los libros
app.get('/libros', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const query = `
            SELECT 
                titulo, 
                autores as autor, 
                materia, 
                edicion, 
                cota, 
                ejemplar, 
                CASE 
                    WHEN disponible = 1 THEN 'Disponible' 
                    ELSE 'No Disponible' 
                END as disponibilidad 
            FROM libros
        `;
        const rows = await conn.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener libros:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        conn.release();
    }
});

// Configuración de Socket.io
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});