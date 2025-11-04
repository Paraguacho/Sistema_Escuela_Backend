const mongoose = require('mongoose');
const { Schema } = mongoose;

const tareaSchema = new Schema({
    nombre: {
        type: String, //Primer parcial - semestre etc
        required: true,
        trim: true
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFinal: {
        type: Date,
        required: true
    },
    fechaLimiteCalificaciones:{
        type: Date,
        required: true //Fecha limite para que suban las calificaciones.
    }
},{
    timestamps: true
});


const Tarea = mongoose.model('Tarea', tareaSchema);
module.exports = Tarea;