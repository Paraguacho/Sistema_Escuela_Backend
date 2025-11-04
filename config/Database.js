const mongoose = require('mongoose');

class Database {
    constructor() {
        this.uri = 'mongodb://localhost:27017';
        this.dbName = 'Sistema_Escuela_Backend';
    }

    /**
     * Conecta a la base de datos usando Mongoose.
     */
    async conectar() {
        try {
            await mongoose.connect(`${this.uri}/${this.dbName}`);
            console.log('Conectado exitosamente a MongoDB con Mongoose');
        } catch (error) {
            console.error('Error al conectar con Mongoose:', error);
            throw error;
        }
    }
    
    /**
     * Desconecta de la base de datos.
     */
    async desconectar() {
        try {
            await mongoose.disconnect();
            console.log('Desconectado de Mongoose');
        } catch (error) {
             console.error('Error al desconectar Mongoose:', error);
            throw error;
        }
    }
}

module.exports = Database;