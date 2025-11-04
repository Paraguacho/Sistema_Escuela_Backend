const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
    remitente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', 
        required: true
    },
    destinatario: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    estadoLeido: {
        type: Boolean,
        default: false        
    }
}, {
    timestamps: true
});

const Mensaje = mongoose.model('Mensaje', mensajeSchema);
module.exports = Mensaje;