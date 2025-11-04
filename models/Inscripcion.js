const mongoose = require('mongoose');

const inscripcionSchema = new mongoose.Schema({
    // Referencia al modelo de Usuario
    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estudiante',
        required: true
    },
    materia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Materia',
        required: true
    },
    periodo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Periodo',
        required: true
    },
    calificacionFinal: {
        type: Number,
        min : 0 ,
        max : 100
    },

}, {
    timestamps: true
});

//Indice para que un estudiante solo pueda inscribirse a una materia en un solo periodo.
inscripcionSchema.index({ estudiante: 1, materia: 1, periodo: 1 }, { unique: true });
const Inscripcion = mongoose.model('Inscripcion', inscripcionSchema);
module.exports = Inscripcion;