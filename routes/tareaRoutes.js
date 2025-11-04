
const express = require('express');
const router = express.Router();

const TareaController = require('../controllers/tareaController.js');
const { protegerRuta } = require('../middleware/authMiddleware.js');

// Todas las rutas de tareas estan protegidas

//  Rutas de Maestro 
// POST /api/tareas/
router.post('/', protegerRuta, TareaController.crearTarea);

// PUT /api/tareas/entrega/:entregaId/calificar
router.put('/entrega/:entregaId/calificar', protegerRuta, TareaController.calificarTarea);


//  Rutas de Estudiante 
// POST /api/tareas/:tareaId/entregar
router.post('/:tareaId/entregar', protegerRuta, TareaController.subirTarea);


//  Rutas de Padre de Familia 
// PUT /api/tareas/entrega/:entregaId/avalar
router.put('/entrega/:entregaId/avalar', protegerRuta, TareaController.avalarTarea);


//  Rutas Compartidas (Padre y Estudiante) 
// GET /api/tareas/progreso/materia/:materiaId?estudianteId=...
router.get('/progreso/materia/:materiaId', protegerRuta, TareaController.obtenerProgresoTareas);


module.exports = router;