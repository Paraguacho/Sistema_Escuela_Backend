const mongoose = require('mongoose');

const estudianteSchema = new mongoose.Schema({
    // Referencia al modelo de Usuario
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', 
        required: true
    },
    matricula: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, {
    timestamps: true
});

const Estudiante = mongoose.model('Estudiante', estudianteSchema);
module.exports = Estudiante;