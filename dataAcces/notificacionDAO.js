const Notificacion = require('../models/Notificacion.js');

class NotificacionDAO {

    /**
     * Crea una nueva notificación.
     * @param {object} datosNotificacion - { usuarioDestino (ID), tipo, contenido, refId }
     * @returns {Promise<object>} El documento de la notificación creada.
     */
    static async crearNotificacion(datosNotificacion) {
        try {
            const notificacion = new Notificacion(datosNotificacion);
            return await notificacion.save();
        } catch (error) {
            throw new Error(`Error al crear la notificación: ${error.message}`);
        }
    }

    /**
     * Busca todas las notificaciones de un usuario.
     * @param {string} idUsuario - El _id del Usuario.
     * @returns {Promise<Array<object>>} Una lista de notificaciones.
     */
    static async buscarPorUsuario(idUsuario) {
        try {
            return await Notificacion.find({ usuarioDestino: idUsuario })
                                     .sort({ createdAt: -1 }); // Más recientes primero
        } catch (error) {
            throw new Error(`Error al buscar notificaciones por usuario: ${error.message}`);
        }
    }

    /**
     * Marca una notificación como leída.
     * @param {string} idNotificacion - El _id de la Notificación.
     * @returns {Promise<object|null>} El documento de la notificación actualizada.
     */
    static async marcarComoLeida(idNotificacion) {
        try {
            return await Notificacion.findByIdAndUpdate(
                idNotificacion, 
                { estado: 'Leída' }, 
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error al marcar notificación como leída: ${error.message}`);
        }
    }
}

module.exports = NotificacionDAO;