const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController.js');

// Ruta definida
// Cuando alguien haga un POST a /api/auth/login, se ejecutará AuthController.login
router.post('/login', AuthController.login);

// Cuando alguien haga un POST a /api/auth/activar-cuenta, se ejecutará AuthController.activarCuenta
router.post('/activar-cuenta', AuthController.activarCuenta);

// Exportamos el router para usarlo en el archivo principal
module.exports = router;