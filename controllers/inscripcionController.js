const InscripcionDAO = require('../dataAcces/inscripcionDAO.js');
const EstudianteDAO = require('../dataAcces/estudianteDAO.js');
const PeriodoDAO = require('../dataAcces/periodoDAO.js');
const PadreHijoDAO = require('../dataAcces/padreHijoDAO.js');

class InscripcionController {

    /**
     * GET /api/inscripciones/mis-materias
     * Devuelve las materias del estudiante logueado en el periodo activo.
     */
    static async obtenerMisMaterias(req, res) {
        try {
            const usuarioId = req.usuario._id;
            const rol = req.usuario.rol;
            
            // Variable para guardar el ID del alumno del que buscaremos materias
            let idEstudianteAConsultar;

            // CASO 1: El usuario es ESTUDIANTE
            if (rol === 'Estudiante') {
                // Se busca a sí mismo en la tabla de estudiantes
                const estudiante = await EstudianteDAO.buscarPorIdUsuario(usuarioId);
                if (!estudiante) {
                    return res.status(404).json({ message: 'Perfil de estudiante no encontrado.' });
                }
                idEstudianteAConsultar = estudiante._id;
            } 
            // CASO 2: El usuario es PADRE DE FAMILIA
            else if (rol === 'Padre de Familia') {
                // El padre debe enviar el ID del hijo en la URL (?estudianteId=...)
                const { estudianteId } = req.query; 

                if (!estudianteId) {
                    return res.status(400).json({ message: 'Debes especificar el ID del estudiante a consultar.' });
                }

                // Validamos que sea SU hijo
                const vinculo = await PadreHijoDAO.buscarVinculo(usuarioId, estudianteId);
                if (!vinculo) {
                    return res.status(403).json({ message: 'No tienes permiso para ver las materias de este estudiante.' });
                }
                
                idEstudianteAConsultar = estudianteId;
            } 
            else {
                return res.status(403).json({ message: 'Rol no autorizado.' });
            }

            // --- Lógica Común (Ahora sí segura) ---
            
            const periodoActivo = await PeriodoDAO.buscarPeriodoActivo();
            if (!periodoActivo) {
                return res.status(404).json({ message: 'No hay un periodo escolar activo.' });
            }

            // Usamos la variable 'idEstudianteAConsultar' que definimos en los IFs de arriba
            const inscripciones = await InscripcionDAO.buscarMateriasPorEstudiante(
                idEstudianteAConsultar, 
                periodoActivo._id
            );

            // Formatear respuesta
            const materias = inscripciones.map(ins => ({
                id: ins.materia._id,
                nombre: ins.materia.nombre,
                maestro: `${ins.materia.maestro.nombre} ${ins.materia.maestro.apellido}`,
                calificacionFinal: ins.calificacionFinal || 'N/A'
            }));

            res.status(200).json(materias);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener materias', error: error.message });
        }
    }
}

module.exports = InscripcionController;