const Usuario = require('../models/Usuario.js');

/**
 * Clase UsuarioDAO para gestionar las operaciones de la bd
 * relacionadas con los usuarios.
 */
class UsuarioDAO {

    /**
     * Crea un nuevo usuario en la base de datos.
     * La contraseña ya vendrá hasheada por el 'pre-save' hook del modelo.
     * @param {object} datosUsuario - Datos del usuario a crear (nombre, correo, password, rol,)
     * @returns {Promise<object>} El documento del usuario creado.
     */
    static async crearUsuario(datosUsuario) {
        try {
            const usuario = new Usuario(datosUsuario);
            return await usuario.save();
        } catch (error) {
            //Para manejar los errores como el correo duplicado o contraseña
            throw new Error(`Error al crear el usuario: ${error.message}`);
        }
    }

    /**
     * Busca un usuario por su dirección de correo electrónico.
     * @param {string} correo - El correo electrónico del usuario.
     * @returns {Promise<object|null>} El documento del usuario si se encuentra, o null.
     */
    static async buscarPorCorreo(correo) {
        try {
            return await Usuario.findOne({ correo: correo });
        } catch (error) {
            throw new Error(`Error al buscar usuario por correo: ${error.message}`);
        }
    }

    /**
     * Busca un usuario por su ID.
     * Por defecto, excluye la contraseña de la respuesta.
     * @param {string} id - El _id del usuario.
     * @returns {Promise<object|null>} El documento del usuario (sin password), o null.
     */
    static async buscarPorId(id) {
        try {
            // .select('-password') excluye el campo de contraseña de la consulta
            return await Usuario.findById(id).select('-password');
        } catch (error) {
            throw new Error(`Error al buscar usuario por ID: ${error.message}`);
        }
    }

    /**
     * Busca un usuario por su código de activación.
     * Solo busca usuarios que aún estén pendientes de activar.
     * @param {string} codigo - El código de activación.
     * @returns {Promise<object|null>} El documento del usuario si se encuentra, o null.
     */
    static async buscarPorCodigoActivacion(codigo) {
        try {
            return await Usuario.findOne({ 
                codigoActivacion: codigo, 
                estadoCuenta: 'Pendiente' 
            });
        } catch (error) {
            throw new Error(`Error al buscar por código de activación: ${error.message}`);
        }
    }

    /**
     * Actualiza un usuario por su ID.
     * @param {string} id - El _id del usuario a actualizar.
     * @param {object} datosActualizar - Un objeto con los campos a actualizar.
     * @returns {Promise<object|null>} El documento del usuario actualizado.
     */
    static async actualizarUsuario(id, datosActualizar) {
        try {
            return await Usuario.findByIdAndUpdate(id, datosActualizar, { new: true });
        } catch (error) {
            throw new Error(`Error al actualizar el usuario: ${error.message}`);
        }
    }

    /**
     * Elimina un usuario por su ID.
     * @param {string} id - El _id del usuario a eliminar.
     * @returns {Promise<object|null>} El documento del usuario que fue eliminado.
     */
    static async eliminarUsuario(id) {
        try {
            return await Usuario.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Error al eliminar el usuario: ${error.message}`);
        }
    }
}

module.exports = UsuarioDAO;