const InscripcionDAO = require('../dataAcces/inscripcionDAO.js');
const EstudianteDAO = require('../dataAcces/estudianteDAO.js');
const PeriodoDAO = require('../dataAcces/periodoDAO.js');

class InscripcionController {

    /**
     * GET /api/inscripciones/mis-materias
     * Devuelve las materias del estudiante logueado en el periodo activo.
     */
    static async obtenerMisMaterias(req, res) {
        try {
            const usuarioId = req.usuario._id;
            const rol = req.usuario.rol;

            // 1. Solo estudiantes (o padres, si implementas esa lógica después)
            if (rol !== 'Estudiante') {
                return res.status(403).json({ message: 'Solo los estudiantes pueden ver sus materias.' });
            }

            // 2. Obtener datos necesarios
            const estudiante = await EstudianteDAO.buscarPorIdUsuario(usuarioId);
            if (!estudiante) return res.status(404).json({ message: 'Perfil de estudiante no encontrado.' });

            const periodoActivo = await PeriodoDAO.buscarPeriodoActivo();
            if (!periodoActivo) return res.status(404).json({ message: 'No hay un periodo escolar activo.' });

            // 3. Buscar inscripciones usando el DAO
            const inscripciones = await InscripcionDAO.buscarMateriasPorEstudiante(
                estudiante._id, 
                periodoActivo._id
            );

            // 4. Formatear la respuesta para que sea limpia
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