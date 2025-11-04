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
     * Busca una tarea por su ID.
     * @param {string} id - El _id de la tarea.
     * @returns {Promise<object|null>} El documento del usuario (sin password), o null.
     */
    static async buscarPorId(id) {
        try {
            // .select('-password') excluye el campo de contraseña de la consulta
            return await Tarea.findById(id);
        } catch (error) {
            throw new Error(`Error al buscar tarea por ID: ${error.message}`);
        }
    }

    /**
     * Busca una entrega por ID y popula los datos de la tarea.
     */
    static async buscarPorIdPopulado(id) {
        try {
            return await EntregaTarea.findById(id).populate('tarea');
        } catch (error) {
            throw new Error(`Error al buscar entrega populada por ID: ${error.message}`);
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