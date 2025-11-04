const Mensaje = require('../models/Mensaje.js');

class MensajeDAO {

    /**
     * Crea un nuevo mensaje.
     * @param {object} datosMensaje - { remitente (ID), destinatario (ID), contenido }
     * @returns {Promise<object>} El documento del mensaje creado.
     */
    static async crearMensaje(datosMensaje) {
        try {
            const mensaje = new Mensaje(datosMensaje);
            return await mensaje.save();
        } catch (error) {
            throw new Error(`Error al crear el mensaje: ${error.message}`);
        }
    }

    /**
     * Busca la conversación (historial de chat) entre dos usuarios.
     * @param {string} idUsuario1 - El _id del primer usuario.
     * @param {string} idUsuario2 - El _id del segundo usuario.
     * @returns {Promise<Array<object>>} Una lista de mensajes.
     */
    static async buscarConversacion(idUsuario1, idUsuario2) {
        try {
            return await Mensaje.find({
                $or: [
                    { remitente: idUsuario1, destinatario: idUsuario2 },
                    { remitente: idUsuario2, destinatario: idUsuario1 }
                ]
            }).sort({ createdAt: 1 }); // Ordena por fecha de creación, del más antiguo al más nuevo
        } catch (error) {
            throw new Error(`Error al buscar la conversación: ${error.message}`);
        }
    }
}

module.exports = MensajeDAO;