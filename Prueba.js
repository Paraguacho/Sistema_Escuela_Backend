const Database = require('./config/Database');
async function pruebaDb() {
    const database = new Database()
    try {
        await database.conectar()
    } catch (error) {
        
    }
}

pruebaDb()
