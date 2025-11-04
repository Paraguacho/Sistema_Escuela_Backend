const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
    usuarioDestino: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', 
        required: true
    },
    tipo: {
        type: String,
        enum: ['Bajo rendimiento','Tarea por vencer','Nuevo Mensaje','Tarea Avalada', 'Calificar Tarea', 'Tarea Calificada'],
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        enum: ['Leida', 'No leida'], 
        default: 'No leida'       
    },
    //Referencia para direccionar al usuario(lo podriamos usar despues)
    refId: { 
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true
});

const Notificacion= mongoose.model('Notificacion', notificacionSchema);
module.exports = Notificacion;