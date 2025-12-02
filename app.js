const express = require('express');
const Database = require('./config/Database'); 
const authRoutes = require('./routes/authRoutes.js');
const tareaRoutes = require('./routes/tareaRoutes.js');
const inscripcionRoutes = require('./routes/inscripcionRoutes.js');

require('dotenv').config(); // Carga las variables de .env

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json()); // Para que Express -> JSON

// deben empezar con el prefijo /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/tareas', tareaRoutes);

// Conectar a la BD e iniciar el servidor
const startServer = async () => {
    try {
        const database = new Database();
        await database.conectar();
        console.log('Base de datos conectada.');
        
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
};

startServer();