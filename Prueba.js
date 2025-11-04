const Database = require('./config/Database');
const UsuarioDAO = require('./dataAcces/usuarioDAO.js');
const EstudianteDAO = require('./dataAcces/estudianteDAO.js');
const PadreHijoDAO = require('./dataAcces/padreHijoDAO.js');
const PeriodoDAO = require('./dataAcces/periodoDAO.js');
const MateriaDAO = require('./dataAcces/materiaDAO.js');
const InscripcionDAO = require('./dataAcces/inscripcionDAO.js');
const TareaDAO = require('./dataAcces/tareaDAO.js')
const EntregaTareaDAO = require('./dataAcces/entregaTareaDAO.js');
const MensajeDAO = require('./dataAcces/mensajeDAO.js');
const NotificacionDAO = require('./dataAcces/notificacionDAO.js');
require('dotenv').config();
/**
 * Función principal de prueba que ejecuta todos los DAOs en secuencia.
 */
async function pruebaDaos() {
    const database = new Database();
    
    // Variables para almacenar los IDs creados
    let maestro, padre, usuarioEstudiante, estudiante, periodo, materia, inscripcion, tarea, entrega;

    try {
        await database.conectar();
        console.log(' Base de datos conectada iniciando prueba de DAO');

        // --- 1. Creación de Usuarios ---
        console.log('\n--- [Probando UsuarioDAO] ---');
        maestro = await UsuarioDAO.crearUsuario({
            nombre: 'Martín',
            apellido: 'Salido',
            email: 'martin.salido@itson.edu.mx',
            password: 'password123', // El modelo se encarga de hashear
            rol: 'Maestro',
            estadoCuenta: 'Activa'
        });
        console.log('Maestro creado:', maestro.nombre, maestro._id);

        padre = await UsuarioDAO.crearUsuario({
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan.perez@gmail.com',
            password: 'password123',
            rol: 'Padre de Familia',
            estadoCuenta: 'Pendiente'
        });
        console.log('Padre creado:', padre.nombre, padre._id);
        
        usuarioEstudiante = await UsuarioDAO.crearUsuario({
            nombre: 'Javier',
            apellido: 'Castillo',
            email: 'javier.castillo@gmail.com',
            password: 'password123',
            rol: 'Estudiante',
            estadoCuenta: 'Activa'
        });
        console.log('Usuario Estudiante creado:', usuarioEstudiante.nombre, usuarioEstudiante._id);
        
        // --- 2. Creación de Estudiante ---
        console.log('\n--- [Probando EstudianteDAO] ---');
        estudiante = await EstudianteDAO.crearEstudiante(usuarioEstudiante._id, '00000239873');
        console.log('Estudiante creado con matrícula:', estudiante.matricula);

        // --- 3. Creación de Vínculo Padre-Hijo ---
        console.log('\n--- [Probando PadreHijoDAO] ---');
        const vinculo = await PadreHijoDAO.crearVinculo(padre._id, estudiante._id);
        console.log('Vínculo Padre-Hijo creado:', vinculo._id);

        const hijos = await PadreHijoDAO.buscarHijosPorPadre(padre._id);
        console.log(`Hijos encontrados para ${padre.nombre}: ${hijos.length}`);
        if (hijos.length > 0) {
            console.log(` -> Matrícula del hijo: ${hijos[0].hijo.matricula}`);
        }

        // --- 4. Creación de Estructura Académica ---
        console.log('\n--- [Probando PeriodoDAO y MateriaDAO] ---');
        periodo = await PeriodoDAO.crearPeriodo({
            nombre: 'Ordinario 2025-1',
            fechaInicio: new Date('2025-08-01T00:00:00Z'),
            fechaFinal: new Date('2025-12-15T23:59:59Z'),
            fechaLimiteCalificaciones: new Date('2025-12-10T23:59:59Z')
        });
        console.log('Periodo creado:', periodo.nombre);
        
        const periodoActivo = await PeriodoDAO.buscarPeriodoActivo();
        console.log('Periodo activo encontrado:', periodoActivo ? periodoActivo.nombre : 'Ninguno');

        materia = await MateriaDAO.crearMateria({
            nombre: 'Arquitecturas Empresariales',
            maestro: maestro._id
        });
        console.log('Materia creada:', materia.nombre);

        // --- 5. Creación de Inscripción ---
        console.log('\n--- [Probando InscripcionDAO] ---');
        inscripcion = await InscripcionDAO.crearInscripcion({
            estudiante: estudiante._id,
            materia: materia._id,
            periodo: periodo._id
        });
        console.log('Inscripción creada:', inscripcion._id);

        const materiasInscritas = await InscripcionDAO.buscarMateriasPorEstudiante(estudiante._id, periodo._id);
        console.log(`Materias inscritas para ${usuarioEstudiante.nombre}: ${materiasInscritas.length}`);
        if (materiasInscritas.length > 0) {
            console.log(` -> Nombre de materia: ${materiasInscritas[0].materia.nombre}`);
        }

        // --- 6. Flujo de Tarea ---
        console.log('\n--- [Probando TareaDAO y EntregaTareaDAO] ---');
        tarea = await TareaDAO.crearTarea({
            materia: materia._id,
            titulo: 'Primer Avance del Proyecto',
            descripcion: 'Entregar el documento de arquitectura.',
            fechaVencimiento: new Date('2025-09-28T23:59:59Z'),
            requiereAval: true
        });
        console.log('Tarea creada:', tarea.titulo);

        entrega = await EntregaTareaDAO.crearEntrega({
            tarea: tarea._id,
            estudiante: estudiante._id,
            archivoUrl: '/uploads/avance1.pdf',
            estado: 'Entregada',
            fechaEntregada: new Date()
        });
        console.log('Entrega creada:', entrega._id, '| Estado:', entrega.estado);

        // Simular Aval del Padre
        const entregaAvalada = await EntregaTareaDAO.actualizarEntrega(entrega._id, {
            estado: 'Avalada',
            padreQueAvalo: padre._id,
            fechaAvalado: new Date()
        });
        console.log('Entrega actualizada (Avalada):', entregaAvalada.estado);

        // Simular Calificación del Maestro
        const entregaCalificada = await EntregaTareaDAO.actualizarEntrega(entrega._id, {
            estado: 'Calificada',
            calificacion: 95,
            comentariosMaestro: 'Buen trabajo en el modelo ArchiMate.',
            fechaCalificado: new Date()
        });
        console.log('Entrega actualizada (Calificada):', entregaCalificada.estado, '| Cal:', entregaCalificada.calificacion);

        // --- 7. Flujo de Comunicación ---
        console.log('\n--- [Probando MensajeDAO y NotificacionDAO] ---');
        const mensaje = await MensajeDAO.crearMensaje({
            remitente: padre._id,
            destinatario: maestro._id,
            contenido: 'Buenas tardes, maestro. ¿Cuándo es la próxima revisión?'
        });
        console.log('Mensaje creado:', `"${mensaje.contenido}"`);

        const conversacion = await MensajeDAO.buscarConversacion(padre._id, maestro._id);
        console.log(`Conversación Padre-Maestro encontrada: ${conversacion.length} mensajes.`);

        const notificacion = await NotificacionDAO.crearNotificacion({
            usuarioDestino: padre._id,
            tipo: 'Tarea Calificada',
            contenido: `El maestro ${maestro.nombre} ha calificado tu tarea "${tarea.titulo}".`,
            refId: entrega._id // ID de la entrega para navegar a ella
        });
        console.log('Notificación creada:', notificacion.tipo);

        const notificaciones = await NotificacionDAO.buscarPorUsuario(padre._id);
        console.log(`Notificaciones encontradas para ${padre.nombre}: ${notificaciones.length}`);
        
        console.log('\n --- Pruebas de DAOs completadas exitosamente ---');

    } catch (error) {
        console.error('\n --- OCURRIÓ UN ERROR DURANTE LAS PRUEBAS ---');
        console.error(error);
    } finally {
        // Asegúrate de que tu clase Database tenga un método para desconectar
        if (database) {
            await database.desconectar();
            console.log(' Base de datos desconectada.');
        }
    }
}

// Ejecuta la función de prueba
pruebaDaos();