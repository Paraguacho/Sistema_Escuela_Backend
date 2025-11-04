/**
 * Middleware para proteger rutas.
 * Verifica el token JWT y añade los datos del usuario a req.usuario.
 */
const jwt = require('jsonwebtoken');
require('dotenv').config();
const UsuarioDAO = require('../dataAcces/usuarioDAO.js');
const protegerRuta = async (req, res, next) => {
    let token;

    //  Verificar si el token viene en la cabecera (header)
    // El formato esperado es: "Bearer <TOKEN>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener el token (quitando la palabra "Bearer")
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token con el secreto
            const decodificado = jwt.verify(token, process.env.JWT_SECRET);

            // Añadir el usuario del payload a la petición (req)
            // Busca al usuario en la BD para tener los datos frescos
            req.usuario = await UsuarioDAO.buscarPorId(decodificado.id);
            
            if (!req.usuario) {
                 return res.status(401).json({ message: 'No autorizado, token falló (usuario no existe).' });
            }

            next();

        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'No autorizado, token falló.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no se proporcionó un token.' });
    }
};

module.exports = { protegerRuta };