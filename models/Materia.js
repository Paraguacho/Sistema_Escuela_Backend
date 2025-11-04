const mongoose = require('mongoose');

const materiaSchema = new mongoose.Schema({
    // Referencia al modelo de Usuario
    nombre: {
        type: String,
        required: true
    },
    maestro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: true
});

const Materia = mongoose.model('Materia', materiaSchema);
module.exports = Materia;