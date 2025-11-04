const Tarea = require('../models/Tarea.js');

class TareaDAO {

    /**
     * Crea una nueva tarea.
     * @param {object} datosTarea - { materia (ID), titulo, descripcion, fechaVencimiento, requiereAval }
     * @returns {Promise<object>} El documento de la tarea creada.
     */
    static async crearTarea(datosTarea) {
        try {
            const tarea = new Tarea(datosTarea);
            return await tarea.save();
        } catch (error) {
            throw new Error(`Error al crear la tarea: ${error.message}`);
        }
    }

    /**
     * Busca todas las tareas de una materia.
     * @param {string} idMateria - El _id de la Materia.
     * @returns {Promise<Array<object>>} Una lista de tareas.
     */
    static async buscarPorMateria(idMateria) {
        try {
            return await Tarea.find({ materia: idMateria }).sort({ fechaVencimiento: 1 });
        } catch (error) {
            throw new Error(`Error al buscar tareas por materia: ${error.message}`);
        }
    }
}

module.exports = TareaDAO;