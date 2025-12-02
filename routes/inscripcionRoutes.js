const express = require('express');
const router = express.Router();
const InscripcionController = require('../controllers/inscripcionController.js');
const { protegerRuta } = require('../middleware/authMiddleware.js');

router.get('/mis-materias', protegerRuta, InscripcionController.obtenerMisMaterias);

module.exports = router;