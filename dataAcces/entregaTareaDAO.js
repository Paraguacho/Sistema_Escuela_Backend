const EntregaTarea = require('../models/entregaTarea.js');

class EntregaTareaDAO {

    /**
     * Crea un registro de entrega de tarea.
     * @param {object} datosEntrega - { tarea (ID), estudiante (ID), archivoUrl, contenidoTexto, estado, fechaEntregada }
     * @returns {Promise<object>} El documento de la entrega creada.
     */
    static async crearEntrega(datosEntrega) {
        try {
            const entrega = new EntregaTarea(datosEntrega);
            return await entrega.save();
        } catch (error) {
            throw new Error(`Error al crear la entrega de tarea: ${error.message}`);
        }
    }

    /**
         * Busca una tarea por su ID.
         * @param {string} id - El _id de la tarea.
         * @returns {Promise<object|null>} El documento del usuario (sin password), o null.
         */
        static async buscarPorId(id) {
            try {
                return await EntregaTarea.findById(id);
            } catch (error) {
                throw new Error(`Error al buscar tarea por ID: ${error.message}`);
            }
        }
    
    /**
     * Busca una entrega específica por Tarea y Estudiante.
     * @param {string} idTarea - El _id de la Tarea.
     * @param {string} idEstudiante - El _id del Estudiante.
     * @returns {Promise<object|null>} El documento de la entrega.
     */
    static async buscarEntrega(idTarea, idEstudiante) {
        try {
            return await EntregaTarea.findOne({ 
                tarea: idTarea, 
                estudiante: idEstudiante 
            });
        } catch (error) {
            throw new Error(`Error al buscar la entrega: ${error.message}`);
        }
    }

    /**
     * Busca todas las entregas de un estudiante para una materia.
     * @param {string} idEstudiante - El _id del Estudiante.
     * @param {string} idMateria - El _id de la Materia.
     * @returns {Promise<Array<object>>} Una lista de entregas.
     */
    static async buscarEntregasPorEstudiante(idEstudiante, idMateria) {
        try {
            // Esta es una consulta más compleja que requiere un 'join'
            const tareasDeMateria = await Tarea.find({ materia: idMateria }).select('_id');
            const idsTareas = tareasDeMateria.map(t => t._id);

            return await EntregaTarea.find({ 
                estudiante: idEstudiante, 
                tarea: { $in: idsTareas } // Busca entregas cuyas tareas estén en la lista
            }).populate('tarea');
        } catch (error) {
            throw new Error(`Error al buscar entregas del estudiante: ${error.message}`);
        }
    }

    /**
     * Busca todas las entregas pendientes de avalar para un padre.
     * @param {Array<string>} idsHijos - Lista de _ids de Estudiante.
     * @returns {Promise<Array<object>>} Lista de entregas pendientes de aval.
     */
    static async buscarPendientesDeAval(idsHijos) {
        try {
            return await EntregaTarea.find({
                estudiante: { $in: idsHijos },
                estado: 'Entregada',
                requiereAval: true // (Este campo debería estar en la Tarea, necesitaríamos un .populate)
            }).populate('tarea').populate('estudiante');
        } catch (error) {
            throw new Error(`Error al buscar pendientes de aval: ${error.message}`);
        }
    }
    
    /**
     * Busca todas las entregas pendientes de calificar para un maestro.
     * @param {Array<string>} idsMaterias - Lista de _ids de Materia.
     * @returns {Promise<Array<object>>} Lista de entregas pendientes de calificar.
     */
    static async buscarPendientesDeCalificar(idsMaterias) {
        try {
            const tareasDeMaestro = await Tarea.find({ materia: { $in: idsMaterias } }).select('_id');
            const idsTareas = tareasDeMaestro.map(t => t._id);

            return await EntregaTarea.find({
                tarea: { $in: idsTareas },
                estado: 'Avalada' // Solo las que ya están avaladas
            }).populate('tarea').populate('estudiante');
        } catch (error) {
            throw new Error(`Error al buscar pendientes de calificar: ${error.message}`);
        }
    }

    /**
     * Busca una entrega por su ID y popula (rellena) la información
     * de la Tarea y la Materia anidadas.
     * @param {string} id - El _id de la EntregaTarea.
     * @returns {Promise<object|null>} El documento de entrega con datos anidados.
     */
    static async buscarPorIdPopulado(id) {
        try {
            
            return await EntregaTarea.findById(id)
                .populate({
                    path: 'tarea', // Rellena el campo 'tarea' (de la Entrega)
                    populate: {
                        path: 'materia' // Rellena el campo 'materia' (DENTRO de la Tarea)
                    }
                });
        } catch (error) {
            throw new Error(`Error al buscar entrega populada por ID: ${error.message}`);
        }
    }
    /**
     * Actualiza una entrega de tarea (para avalar, calificar, etc.)
     * @param {string} idEntrega - El _id de la EntregaTarea.
     * @param {object} datosActualizar - Objeto con los campos a actualizar (ej. { estado, calificacion, padreQueAvalo, ... })
     * @returns {Promise<object|null>} El documento de entrega actualizado.
     */
    static async actualizarEntrega(idEntrega, datosActualizar) {
        try {
            return await EntregaTarea.findByIdAndUpdate(idEntrega, datosActualizar, { new: true });
        } catch (error) {
            throw new Error(`Error al actualizar la entrega: ${error.message}`);
        }
    }
}

module.exports = EntregaTareaDAO;