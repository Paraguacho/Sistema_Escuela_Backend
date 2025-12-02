const UsuarioDAO = require('../dataAcces/usuarioDAO');
//Importar jwt para crear el token
const jwt = require('jsonwebtoken');
//Importar dotenv para variable de entorno
const EstudianteDAO = require('../dataAcces/estudianteDAO.js');
const PadreHijoDAO = require('../dataAcces/padreHijoDAO.js');
require('dotenv').config();
class AuthController {

    /**
     * Maneja el inicio de sesión del usuario.
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validar que vengan los datos
            if (!email || !password) {
                return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
            }

            // Buscar al usuario usando el DAO
            const usuario = await UsuarioDAO.buscarPorCorreo(email);
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }

            // Verificar que la cuenta esté activa
            if (usuario.estadoCuenta !== 'Activa') {
                return res.status(403).json({ message: 'Esta cuenta está pendiente de activación.' });
            }

            // Comparar la contraseña usando el método del Modelo
            const isPasswordCorrect = await usuario.comparePassword(password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'Contraseña incorrecta.' });
            }

            // Si todo es correcto, crear el Token (JWT)
            const payload = {
                id: usuario._id,
                rol: usuario.rol
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
            let datosExtra = {};
            if (usuario.rol === 'Estudiante') {
                const estudiante = await EstudianteDAO.buscarPorIdUsuario(usuario._id);
                if (estudiante) {
                    datosExtra.estudianteId = estudiante._id;
                }
            } else if (usuario.rol === 'Padre de Familia') {
                const hijos = await PadreHijoDAO.buscarHijosPorPadre(usuario._id);
                datosExtra.hijos = hijos; // Enviamos la lista de hijos
            }

            // Enviar la respuesta exitosa
            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token: token,
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    rol: usuario.rol,
                    ...datosExtra 
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

            //  Validar entrada
            if (!codigoActivacion || !password) {
                return res.status(400).json({ message: 'Código de activación y contraseña son requeridos.' });
            }

            //  Buscar al usuario por el código usando el DAO
            const usuario = await UsuarioDAO.buscarPorCodigoActivacion(codigoActivacion);
            if (!usuario) {
                return res.status(404).json({ message: 'Código de activación no válido o ya fue usado.' });
            }

            // Actualizar el usuario.
            // necesita disparar el hook pre-save para hashear la nueva contraseña
            usuario.password = password;
            usuario.estadoCuenta = 'Activa';
            usuario.codigoActivacion = undefined; // El código es de un solo uso

            await usuario.save(); 

            // Enviar respuesta exitosa
            res.status(200).json({ message: 'Cuenta activada exitosamente. Ahora puedes iniciar sesión.' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }
}

module.exports = AuthController;