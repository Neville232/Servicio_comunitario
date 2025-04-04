// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// Importar las dependencias necesarias
const express = require('express'); // Framework para crear el servidor
const pool = require('./database'); // Conexión a la base de datos MariaDB
const WebSocket = require('ws'); // Biblioteca para WebSocket
const cors = require('cors'); // Middleware para habilitar CORS

// Crear una instancia de la aplicación Express
const app = express();

// Middleware para procesar JSON en las solicitudes
app.use(express.json());

// Middleware para habilitar CORS (permite solicitudes desde otros dominios)
app.use(cors());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Crear un servidor WebSocket en el puerto 8080
const wss = new WebSocket.Server({ port: 8080 });

// Evento que se ejecuta cuando un cliente se conecta al WebSocket
wss.on('connection', (ws) => {
    console.log('Cliente conectado');
});

// Ruta para crear un nuevo registro en la base de datos
app.post('/crear', async (req, res) => {
    try {
        // Extraer los datos enviados en el cuerpo de la solicitud
        const { nombre, email, mensaje } = req.body;

        // Obtener una conexión al pool de MariaDB
        const conn = await pool.getConnection();

        // Ejecutar la consulta para insertar un nuevo registro
        await conn.query("INSERT INTO formularios (nombre, email, mensaje) VALUES (?, ?, ?)", [nombre, email, mensaje]);

        // Liberar la conexión
        conn.release();

        // Notificar a todos los clientes conectados al WebSocket sobre el nuevo registro
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'crear', data: { nombre, email, mensaje } }));
            }
        });

        // Responder con éxito
        res.json({ success: true });
    } catch (err) {
        // Manejar errores y responder con un código de error 500
        res.status(500).json({ error: err.message });
    }
});

// Ruta para obtener todos los registros de la base de datos
app.get('/formularios', async (req, res) => {
    try {
        // Obtener una conexión al pool de MariaDB
        const conn = await pool.getConnection();

        // Ejecutar la consulta para obtener todos los registros
        const rows = await conn.query("SELECT * FROM formularios");

        // Liberar la conexión
        conn.release();

        // Responder con los registros obtenidos
        res.json(rows);
    } catch (err) {
        // Manejar errores y responder con un código de error 500
        res.status(500).json({ error: err.message });
    }
});

// Ruta para actualizar un registro existente en la base de datos
app.put('/actualizar/:id', async (req, res) => {
    try {
        // Obtener el ID del registro desde los parámetros de la URL
        const { id } = req.params;

        // Extraer los datos enviados en el cuerpo de la solicitud
        const { nombre, email, mensaje } = req.body;

        // Obtener una conexión al pool de MariaDB
        const conn = await pool.getConnection();

        // Ejecutar la consulta para actualizar el registro
        await conn.query("UPDATE formularios SET nombre = ?, email = ?, mensaje = ? WHERE id = ?", [nombre, email, mensaje, id]);

        // Liberar la conexión
        conn.release();

        // Notificar a todos los clientes conectados al WebSocket sobre la actualización
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'actualizar', data: { id, nombre, email, mensaje } }));
            }
        });

        // Responder con éxito
        res.json({ success: true });
    } catch (err) {
        // Manejar errores y responder con un código de error 500
        res.status(500).json({ error: err.message });
    }
});

// Ruta para eliminar un registro de la base de datos
app.delete('/eliminar/:id', async (req, res) => {
    try {
        // Obtener el ID del registro desde los parámetros de la URL
        const { id } = req.params;

        // Obtener una conexión al pool de MariaDB
        const conn = await pool.getConnection();

        // Ejecutar la consulta para eliminar el registro
        await conn.query("DELETE FROM formularios WHERE id = ?", [id]);

        // Liberar la conexión
        conn.release();

        // Notificar a todos los clientes conectados al WebSocket sobre la eliminación
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'eliminar', data: { id } }));
            }
        });

        // Responder con éxito
        res.json({ success: true });
    } catch (err) {
        // Manejar errores y responder con un código de error 500
        res.status(500).json({ error: err.message });
    }
});

// Iniciar el servidor en el puerto especificado en las variables de entorno o en el puerto 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});