const PadreHijo = require('../models/PadreHijo.js')
class PadreHijoDAO {

    /**
     * Crea un nuevo vínculo entre un padre y un hijo.
     * @param {string} idPadre - El _id del Usuario (Padre).
     * @param {string} idHijo - El _id del Estudiante (Hijo).
     * @returns {Promise<object>} El documento del vínculo creado.
     */
    static async crearVinculo(idPadre, idHijo) {
        try {
            const vinculo = new PadreHijo({
                padre: idPadre,
                hijo: idHijo
            });
            return await vinculo.save();
        } catch (error) {
            throw new Error(`Error al crear vínculo padre-hijo: ${error.message}`);
        }
    }

    static async buscarVinculo(idPadre, idHijo) {
        try {
            return await PadreHijo.findOne({
                padre: idPadre,
                hijo: idHijo
            });
        } catch (error) {
            throw new Error(`Error al buscar el vínculo: ${error.message}`);
        }
    }

    /**
     * Busca todos los hijos asociados a un ID de padre.
     * @param {string} idPadre - El _id del Usuario (Padre).
     * @returns {Promise<Array<object>>} Una lista de documentos de vínculo.
     */
    static async buscarHijosPorPadre(idPadre) {
        try {
            
            return await PadreHijo.find({ padre: idPadre })
                .populate({
                    path: 'hijo',
                    populate: {
                        path: 'usuario',
                        select: 'nombre apellido' // Solo trae nombre y apellido
                    }
                });
        } catch (error) {
            throw new Error(`Error al buscar hijos por padre: ${error.message}`);
        }
    }

    /**
     * Busca todos los padres asociados a un ID de hijo.
     * @param {string} idHijo - El _id del Estudiante (Hijo).
     * @returns {Promise<Array<object>>} Una lista de documentos de vínculo.
     */
    static async buscarPadresPorHijo(idHijo) {
        try {
            // .populate('padre', '-password') trae los datos del padre, excluyendo la contraseña.
            return await PadreHijo.find({ hijo: idHijo }).populate('padre', '-password');
        } catch (error) {
            throw new Error(`Error al buscar padres por hijo: ${error.message}`);
        }
    }
}

module.exports = PadreHijoDAO;