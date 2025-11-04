const UsuarioDAO = require('../dataAcces/usuarioDAO');
//Importar jwt para crear el token
const jwt = require('jsonwebtoken');
//Importar dotenv para variable de entorno
require('dotenv').config();
class AuthController {

    /**
     * Maneja el inicio de sesión del usuario.
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // 1. Validar que vengan los datos
            if (!email || !password) {
                return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
            }

            // 2. Buscar al usuario usando el DAO
            const usuario = await UsuarioDAO.buscarPorCorreo(email);
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }

            // 3. Verificar que la cuenta esté activa
            if (usuario.estadoCuenta !== 'Activa') {
                return res.status(403).json({ message: 'Esta cuenta está pendiente de activación.' });
            }

            // 4. Comparar la contraseña (usando el método del Modelo)
            const isPasswordCorrect = await usuario.comparePassword(password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'Contraseña incorrecta.' });
            }

            // 5. Si todo es correcto, crear el Token (JWT)
            const payload = {
                id: usuario._id,
                rol: usuario.rol
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '1d' // El token expira en 1 día
            });

            // 6. Enviar la respuesta exitosa
            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token: token,
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    rol: usuario.rol
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }

    /**
     * Maneja la activación de la cuenta de un padre.
     */
    static async activarCuenta(req, res) {
        try {
            const { codigoActivacion, password } = req.body;

            // 1. Validar entrada
            if (!codigoActivacion || !password) {
                return res.status(400).json({ message: 'Código de activación y contraseña son requeridos.' });
            }

            // 2. Buscar al usuario por el código usando el DAO
            const usuario = await UsuarioDAO.buscarPorCodigoActivacion(codigoActivacion);
            if (!usuario) {
                return res.status(404).json({ message: 'Código de activación no válido o ya fue usado.' });
            }

            // 3. Actualizar el usuario.
            // Esta es la única vez que el controlador llama a .save()
            // porque necesitamos disparar el hook 'pre-save' para hashear la nueva contraseña)
            usuario.password = password;
            usuario.estadoCuenta = 'Activa';
            usuario.codigoActivacion = undefined; // El código es de un solo uso

            await usuario.save(); // ¡Esto hasheará la contraseña automáticamente!

            // 4. Enviar respuesta exitosa
            res.status(200).json({ message: 'Cuenta activada exitosamente. Ahora puedes iniciar sesión.' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }
}

module.exports = AuthController;