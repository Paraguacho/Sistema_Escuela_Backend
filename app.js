const express = require('express');
const Database = require('./config/Database'); 
const authRoutes = require('./routes/authRoutes.js');

require('dotenv').config(); // Carga las variables de .env

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json()); // Para que Express entienda JSON


// Le decimos a Express que todas las rutas en authRoutes
// deben empezar con el prefijo /api/auth
app.use('/api/auth', authRoutes);

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