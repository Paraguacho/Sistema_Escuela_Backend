const Materia = require('../models/Materia.js');

class MateriaDAO {

    /**
     * Crea una nueva materia.
     * @param {object} datosMateria - { nombre, maestro (ID) }
     * @returns {Promise<object>} El documento de la materia creada.
     */
    static async crearMateria(datosMateria) {
        try {
            const materia = new Materia(datosMateria);
            return await materia.save();
        } catch (error) {
            throw new Error(`Error al crear la materia: ${error.message}`);
        }
    }

    /**
     * Busca todas las materias impartidas por un maestro.
     * @param {string} idMaestro - El _id del Usuario (Maestro).
     * @returns {Promise<Array<object>>} Una lista de materias.
     */
    static async buscarPorMaestro(idMaestro) {
        try {
            return await Materia.find({ maestro: idMaestro });
        } catch (error) {
            throw new Error(`Error al buscar materias por maestro: ${error.message}`);
        }
    }
}

module.exports = MateriaDAO;