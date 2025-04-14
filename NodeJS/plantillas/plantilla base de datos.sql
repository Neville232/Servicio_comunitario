-- Crear la base de datos llamada "biblioteca"
CREATE DATABASE biblioteca;

-- Usar la base de datos "biblioteca"
USE biblioteca;

-- Crear la tabla de usuarios (tabla principal para login y control de acceso)
CREATE TABLE usuarios (
    usuarios_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    rfid INT NOT NULL UNIQUE, -- El RFID debe ser único para cualquier usuario
    tipo_de_usuario ENUM('alumno', 'empleado') NOT NULL, -- Define si es alumno o empleado
    usuario VARCHAR(255) NOT NULL UNIQUE, -- Nombre de usuario único para login
    contrasena VARCHAR(255) NOT NULL -- Contraseña para login
);

-- Crear la tabla de alumnos (relacionada con usuarios)
CREATE TABLE alumnos (
    alumnos_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    usuarios_id INT UNSIGNED NOT NULL, -- Relación con la tabla usuarios
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    expediente INT NOT NULL UNIQUE,
    cedula INT NOT NULL UNIQUE,
    telefono VARCHAR(11) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    semestre INT NOT NULL,
    carrera VARCHAR(255) NOT NULL,
    CONSTRAINT alumnos_usuarios_id_foreign FOREIGN KEY (usuarios_id) REFERENCES usuarios(usuarios_id)
);

-- Crear la tabla de empleados (relacionada con usuarios)
CREATE TABLE empleados (
    empleados_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    usuarios_id INT UNSIGNED NOT NULL, -- Relación con la tabla usuarios
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    cedula INT NOT NULL UNIQUE,
    telefono VARCHAR(11) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    cargo VARCHAR(255) NOT NULL, -- Cargo del empleado (para permisos)
    CONSTRAINT empleados_usuarios_id_foreign FOREIGN KEY (usuarios_id) REFERENCES usuarios(usuarios_id)
);

-- Crear la tabla de asistencia de empleados (relacionada con empleados)
CREATE TABLE asistencia_de_empleados (
    asistencia_de_empleados_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT UNSIGNED NOT NULL, -- Relación con la tabla empleados
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL,
    CONSTRAINT asistencia_de_empleados_empleado_id_foreign FOREIGN KEY (empleado_id) REFERENCES empleados(empleados_id)
);

-- Crear la tabla de libros (independiente de las demás)
CREATE TABLE libros (
    libros_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autores VARCHAR(255) NOT NULL,
    materia VARCHAR(255) NOT NULL,
    edicion INT NOT NULL,
    cota VARCHAR(255) NOT NULL,
    ejemplar INT NOT NULL,
    disponible BOOLEAN NOT NULL -- Indica si el libro está disponible para préstamo
);

-- Crear la tabla de préstamos (relacionada con alumnos y libros)
CREATE TABLE prestamos (
    prestamos_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    alumnos_id INT UNSIGNED NOT NULL, -- Relación con la tabla alumnos
    libros_id INT UNSIGNED NOT NULL, -- Relación con la tabla libros
    fecha_retiro DATE NOT NULL,
    fecha_entrega DATE NOT NULL,
    CONSTRAINT prestamos_alumnos_id_foreign FOREIGN KEY (alumnos_id) REFERENCES alumnos(alumnos_id),
    CONSTRAINT prestamos_libros_id_foreign FOREIGN KEY (libros_id) REFERENCES libros(libros_id)
);