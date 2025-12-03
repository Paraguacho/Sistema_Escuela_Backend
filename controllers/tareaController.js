const TareaDAO = require('../dataAcces/tareaDAO.js');
const EntregaTareaDAO = require('../dataAcces/entregaTareaDAO.js');
const MateriaDAO = require('../dataAcces/materiaDAO.js');
const EstudianteDAO = require('../dataAcces/estudianteDAO.js');
const InscripcionDAO = require('../dataAcces/inscripcionDAO.js');
const PadreHijoDAO = require('../dataAcces/padreHijoDAO.js');
const NotificacionDAO = require('../dataAcces/notificacionDAO.js'); // Para notificar
const PeriodoDAO = require('../dataAcces/periodoDAO.js');
class TareaController {

    /**
     * POST /api/tareas
     * Crea una nueva tarea (asignación).
     * Solo para rol 'Maestro'.
     */
    static async crearTarea(req, res) {
        try {
            // El usuario viene del middleware protegerRuta
            const maestroId = req.usuario._id;
            const rolMaestro = req.usuario.rol;

            // Autorización: Solo Maestros
            if (rolMaestro !== 'Maestro') {
                return res.status(403).json({ message: 'Acceso prohibido. Solo los maestros pueden crear tareas.' });
            }

            // El ID de la materia a la que se asignará la tarea
            const { materia, titulo, descripcion, fechaVencimiento, requiereAval } = req.body;
            
            if (!materia || !titulo || !descripcion || !fechaVencimiento) {
                return res.status(400).json({ message: 'Faltan datos (materia, titulo, descripcion, fechaVencimiento).' });
            }


            // Validación de Propiedad este maestro da esta materia
            // Obten la lista las materias que da este maestro
            const materiasDelMaestro = await MateriaDAO.buscarPorMaestro(maestroId);

            //Busca si lamateria (el ID que viene en el body) 
            //    esta DENTRO de la lista de materias del maestro.
            const esSuMateria = materiasDelMaestro.find(
                (m) => m._id.toString() === materia.toString()
            );

            if (!esSuMateria) {
                return res.status(403).json({ message: 'No tienes permiso para crear tareas en esta materia.' });
            }
            



            // Usar el DAO para crear la tarea 
            const tareaNueva = await TareaDAO.crearTarea({
                materia: materia, // Ahora sabemos que este ID de materia es válido
                titulo: titulo,
                descripcion: descripcion,
                fechaVencimiento: fechaVencimiento,
                requiereAval: requiereAval || false
            });

            // Responder
            res.status(201).json({ message: 'Tarea creada exitosamente', tarea: tareaNueva });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }

    /**
     * POST /api/tareas/:tareaId/entregar
     * Sube una entrega de tarea.
     * Solo para rol 'Estudiante'.
     */
    static async subirTarea(req, res) {
        try {
            const usuarioEstudianteId = req.usuario._id;
            const rolEstudiante = req.usuario.rol;
            const { tareaId } = req.params;
            const { contenidoTexto, archivoUrl } = req.body; 

            // Autorización Solo Estudiantes
            if (rolEstudiante !== 'Estudiante') {
                return res.status(403).json({ message: 'Acceso prohibido. Solo los estudiantes pueden entregar tareas.' });
            }

            // Validación de Propiedad Este estudiante está inscrito en la materia de esta tarea
            const [tarea, estudiante, periodoActivo] = await Promise.all([
                
                TareaDAO.buscarPorId(tareaId),
                EstudianteDAO.buscarPorIdUsuario(usuarioEstudianteId),
                PeriodoDAO.buscarPeriodoActivo()
            ]);
        
            

            
            if (!tarea || !estudiante || !periodoActivo) { 
                 return res.status(404).json({ message: 'No se encontró la tarea, el estudiante o el periodo activo.'});
            }

            // Ya que periodoActivo no es null se puede acceder a su propiedad ._id
            const inscripcion = await InscripcionDAO.buscarInscripcion(estudiante._id, tarea.materia, periodoActivo._id);

            if (!inscripcion) {
                return res.status(403).json({ message: 'No puedes entregar una tarea de una materia a la que no estás inscrito.' });
            }

            // Crear la entrega
            const entregaNueva = await EntregaTareaDAO.crearEntrega({
                tarea: tareaId,
                estudiante: estudiante._id,
                contenidoTexto: contenidoTexto,
                archivoUrl: archivoUrl,
                estado: 'Entregada', // Estado inicial
                fechaEntregada: new Date()
            });

            // 4. Notificar al Padre si requiere aval y al Maestro
            if (tarea.requiereAval) {
                const padres = await PadreHijoDAO.buscarPadresPorHijo(estudiante._id);
                for (const vinculo of padres) {
                    await NotificacionDAO.crearNotificacion({
                        usuarioDestino: vinculo.padre._id,
                        tipo: 'Tarea por Avalar',
                        contenido: `Tu hijo ${req.usuario.nombre} ha entregado la tarea "${tarea.titulo}". Requiere tu aval.`
                    });
                }
            }

            res.status(201).json({ message: 'Tarea entregada exitosamente', entrega: entregaNueva });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }

    /**
     * PUT /api/tareas/entrega/:entregaId/avalar
     * Avala una entrega de tarea.
     * Solo para rol 'Padre de Familia'.
     */
    static async avalarTarea(req, res) {
        try {
            const padreId = req.usuario._id;
            const rolPadre = req.usuario.rol;
            const { entregaId } = req.params;

            // Autorizacion Solo Padres
            if (rolPadre !== 'Padre de Familia') {
                return res.status(403).json({ message: 'Acceso prohibido. Solo los padres pueden avalar tareas.' });
            }

            // Validación de Propiedad ¿Este padre es tutor del estudiante que hizo esta entrega?
            const entrega = await EntregaTareaDAO.buscarPorId(entregaId);
            if (!entrega) {
                return res.status(404).json({ message: 'Entrega no encontrada.' });
            }

            const vinculo = await PadreHijoDAO.buscarVinculo(padreId, entrega.estudiante);
            if (!vinculo) {
                return res.status(403).json({ message: 'No tienes permiso para avalar la tarea de este estudiante.' });
            }

            // Validación de Estado Solo se puede avalar si está Entregada
            if (entrega.estado !== 'Entregada') {
                return res.status(409).json({ message: `No se puede avalar. Estado actual: ${entrega.estado}` });
            }

            // Actualizar la entrega
            const datosActualizar = {
                estado: 'Avalada',
                padreQueAvalo: padreId,
                fechaAvalado: new Date()
            };
            const entregaAvalada = await EntregaTareaDAO.actualizarEntrega(entregaId, datosActualizar);

            // Notificar al Maestro
            const tarea = await TareaDAO.buscarPorId(entrega.tarea);
            await NotificacionDAO.crearNotificacion({
                usuarioDestino: tarea.materia.maestro, 
                tipo: 'Tarea Avalada',
                contenido: `La tarea "${tarea.titulo}" (entregada por ${entrega.estudiante.matricula}) ha sido avalada y está lista para calificar.`
            });

            res.status(200).json({ message: 'Tarea avalada exitosamente', entrega: entregaAvalada });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }
    
    /**
     * PUT /api/tareas/entrega/:entregaId/calificar
     * Califica una entrega de tarea.
     * Solo para rol 'Maestro'.
     */
    static async calificarTarea(req, res) {
        try {
            const maestroId = req.usuario._id;
            const rolMaestro = req.usuario.rol;
            const { entregaId } = req.params;
            const { calificacion, comentariosMaestro } = req.body;

            //  Autorización Solo Maestros
            if (rolMaestro !== 'Maestro') {
                return res.status(403).json({ message: 'Acceso prohibido. Solo los maestros pueden calificar.' });
            }
            if (!calificacion) {
                return res.status(400).json({ message: 'La calificación es requerida.' });
            }

            const entrega = await EntregaTareaDAO.buscarPorIdPopulado(entregaId); 
            if (!entrega || !entrega.tarea || !entrega.tarea.materia) {
                 return res.status(404).json({ message: 'Entrega, Tarea o Materia no encontrada.' });
            }
            const materia = entrega.tarea.materia; 
            
            if (materia.maestro.toString() !== maestroId.toString()) {
                return res.status(403).json({ message: 'No tienes permiso para calificar tareas de esta materia.' });
            }

            // Validación de Estado Solo se puede calificar si está Avalada o 'Entregada' si no requiere aval
            const tarea = entrega.tarea;
            const estadoRequerido = tarea.requiereAval ? 'Avalada' : 'Entregada';
            
            if (entrega.estado !== estadoRequerido) {
                return res.status(409).json({ message: `No se puede calificar. La tarea debe estar en estado "${estadoRequerido}". Estado actual: ${entrega.estado}` });
            }

            //  Actualizar la entrega
            const datosActualizar = {
                estado: 'Calificada',
                calificacion: calificacion,
                comentariosMaestro: comentariosMaestro,
                fechaCalificado: new Date()
            };
            const entregaCalificada = await EntregaTareaDAO.actualizarEntrega(entregaId, datosActualizar);
            
            //  Notificar al Padre y al Estudiante
            const estudiante = await EstudianteDAO.buscarPorId(entrega.estudiante);
            const padres = await PadreHijoDAO.buscarPadresPorHijo(estudiante._id);
            
            const notificacionContenido = `La tarea "${tarea.titulo}" ha sido calificada con ${calificacion}.`;
            
            // Al Estudiante
            await NotificacionDAO.crearNotificacion({
                usuarioDestino: estudiante.usuario,
                tipo: 'Tarea Calificada',
                contenido: notificacionContenido
            });
            // A los Padres
            for (const vinculo of padres) {
                 await NotificacionDAO.crearNotificacion({
                    usuarioDestino: vinculo.padre._id,
                    tipo: 'Tarea Calificada',
                    contenido: notificacionContenido
                });
            }

            res.status(200).json({ message: 'Tarea calificada exitosamente', entrega: entregaCalificada });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }


    /**
     * GET /api/tareas/progreso/materia/:materiaId
     * Obtiene el progreso de un estudiante en una materia.
     * Usado por Estudiantes y Padres.
     */
    static async obtenerProgresoTareas(req, res) {
        try {
            const { materiaId } = req.params;
            const { estudianteId } = req.query;
            const usuarioAutenticado = req.usuario;

            if (!estudianteId) {
                return res.status(400).json({ message: 'El ID del estudiante es requerido.' });
            }

            //  Autorización
            const estudiante = await EstudianteDAO.buscarPorId(estudianteId);
            if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado.' });
            
            let esPropietario = (usuarioAutenticado.rol === 'Estudiante' && estudiante.usuario.toString() === usuarioAutenticado._id.toString());
            
            // Padre.
            if (!esPropietario && usuarioAutenticado.rol === 'Padre de Familia') {
                 const vinculo = await PadreHijoDAO.buscarVinculo(usuarioAutenticado._id, estudianteId);
                 if (vinculo) {
                     esPropietario = true;
                 }
            }
            
            if (!esPropietario) {
                return res.status(403).json({ message: 'No tienes permiso para ver el progreso de este estudiante.' });
            }

            // Obtener los datos usando el DAO
            // Necesita un DAO que combine Tareas y Entregas
            const [tareas, entregas] = await Promise.all([
                TareaDAO.buscarPorMateria(materiaId),
                EntregaTareaDAO.buscarEntregasPorEstudiante(estudianteId, materiaId)
            ]);

            // 3. Combinar los resultados
            // Creamos un mapa de entregas para fácil acceso
            const mapaEntregas = new Map();
            entregas.forEach(entrega => {
                mapaEntregas.set(entrega.tarea._id.toString(), entrega);
            });

            const progreso = tareas.map(tarea => {
                const entrega = mapaEntregas.get(tarea._id.toString());
                
                return {
                    id: tarea._id, 
                    tarea: tarea.titulo,
                    descripcion: tarea.descripcion, // <--- AGREGAR: Instrucciones
                    fechaVencimiento: tarea.fechaVencimiento,
                    requiereAval: tarea.requiereAval,
                    entrega: entrega ? {
                        id: entrega._id,
                        estado: entrega.estado,
                        calificacion: entrega.calificacion,
                        comentarios: entrega.comentariosMaestro,
                        contenidoTexto: entrega.contenidoTexto,
                        archivoUrl: entrega.archivoUrl,
                        fechaEntregada: entrega.fechaEntregada,
                        fechaAvalado: entrega.fechaAvalado
                    } : null
                };
            });

            res.status(200).json(progreso);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }

}

module.exports = TareaController;