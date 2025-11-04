const Inscripcion = require('../models/Inscripcion.js');

class InscripcionDAO {

    /**
     * Inscribe un estudiante a una materia en un periodo.
     * @param {object} datosInscripcion - { estudiante (ID), materia (ID), periodo (ID) }
     * @returns {Promise<object>} El documento de la inscripción creada.
     */
    static async crearInscripcion(datosInscripcion) {
        try {
            const inscripcion = new Inscripcion(datosInscripcion);
            return await inscripcion.save();
        } catch (error) {
            throw new Error(`Error al crear la inscripción: ${error.message}`);
        }
    }

    /**
     * Busca una inscripción específica por Estudiante, Materia y Periodo.
     */
    static async buscarInscripcion(idEstudiante, idMateria, idPeriodo) {
        try {
            return await Inscripcion.findOne({
                estudiante: idEstudiante,
                materia: idMateria,
                periodo: idPeriodo
            });
        } catch (error) {
            throw new Error(`Error al buscar la inscripción: ${error.message}`);
        }
    }

    /**
     * Busca todas las inscripciones (materias) de un estudiante para un periodo.
     * @param {string} idEstudiante - El _id del Estudiante.
     * @param {string} idPeriodo - El _id del Periodo.
     * @returns {Promise<Array<object>>} Una lista de inscripciones.
     */
    static async buscarMateriasPorEstudiante(idEstudiante, idPeriodo) {
        try {
            return await Inscripcion.find({ 
                estudiante: idEstudiante, 
                periodo: idPeriodo 
            })
            .populate({
                path: 'materia', // Trae los datos de la materia
                populate: {
                    path: 'maestro', // Y dentro de materia, trae los datos del maestro
                    select: '-password' // Excluye la contraseña del maestro
                }
            });
        } catch (error) {
            throw new Error(`Error al buscar materias del estudiante: ${error.message}`);
        }
    }

    /**
     * Busca todos los estudiantes inscritos a una materia de un maestro.
     * @param {string} idMateria - El _id de la Materia.
     * @param {string} idPeriodo - El _id del Periodo.
     * @returns {Promise<Array<object>>} Una lista de inscripciones.
     */
    static async buscarEstudiantesPorMateria(idMateria, idPeriodo) {
        try {
            return await Inscripcion.find({ 
                materia: idMateria, 
                periodo: idPeriodo 
            })
            .populate('estudiante'); // Trae los datos del estudiante
        } catch (error) {
            throw new Error(`Error al buscar estudiantes por materia: ${error.message}`);
        }
    }
    
    /**
     * Actualiza la calificación final de una inscripción.
     * @param {string} idInscripcion - El _id de la Inscripción.
     * @param {number} calificacion - La calificación final.
     * @returns {Promise<object|null>} El documento de inscripción actualizado.
     */
    static async actualizarCalificacionFinal(idInscripcion, calificacion) {
        try {
            return await Inscripcion.findByIdAndUpdate(
                idInscripcion, 
                { calificacionFinal: calificacion }, 
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error al actualizar la calificación final: ${error.message}`);
        }
    }
}

module.exports = InscripcionDAO;