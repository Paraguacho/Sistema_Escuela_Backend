const Estudiante = require('../models/Estudiante.js');
const mongoose = require('mongoose');

/**
 * Clase EstudianteDAO para gestionar las operaciones de la bd
 * relacionadas con los estudiantes.
 */
class EstudianteDAO {
    
    /**
     * Crea un nuevo estudiante.
     * @param {string} idUsuario - El ID del Usuario (de la colección 'usuarios')
     * @param {string} matricula - La matrícula del estudiante
     * @returns {Promise<object>} El documento del estudiante creado.
     */
    static async crearEstudiante(idUsuario, matricula) {
        try {
            const estudiante = new Estudiante({
                usuario: idUsuario,
                matricula: matricula
            });
            return await estudiante.save();
        } catch (error) {
            throw new Error(`Error al crear estudiante: ${error.message}`);
        }
    }

    /**
     * Busca un estudiante por su ID de Usuario.
     * @param {string} idUsuario - El _id del usuario.
     * @returns {Promise<object|null>} El documento del estudiante.
     */
    static async buscarPorIdUsuario(idUsuario) {
        try {
            return await Estudiante.findOne({ usuario: idUsuario });
        } catch (error) {
            throw new Error(`Error al buscar estudiante por ID de usuario: ${error.message}`);
        }
    }

    /**
     * Busca un estudiante por su matrícula.
     * @param {string} matricula - La matrícula del estudiante.
     * @returns {Promise<object|null>} El documento del estudiante.
     */
    static async buscarPorMatricula(matricula) {
        try {
            return await Estudiante.findOne({ matricula: matricula });
        } catch (error) {
            throw new Error(`Error al buscar estudiante por matrícula: ${error.message}`);
        }
    }

    /**
     * Elimina un estudiante por su matricula.
     * @param {string} matricula - La matricula del estudiante a eliminar.
     * @returns {Promise<object|null>} El documento del estudiante que fue eliminado.
     */
    static async eliminarEstudiantePorMatricula(matricula) {
        try {
            return await Estudiante.findByIdAndDelete(matricula);
        } catch (error) {
            throw new Error(`Error al eliminar el estudiante: ${error.message}`);
        }
    }
    
}

module.exports = EstudianteDAO;