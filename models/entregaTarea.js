const mongoose = require('mongoose');
const { Schema } = mongoose;

const entregaTareaSchema = new Schema({
    tarea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tarea',
        required: true,
    },
    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estudiante',
        required: true
    },
    archivoUrl: {
        type: String,
        required: true
    },
    contenidoTexto: { //Para las tareas que solo sean texto.
        type: String
    },
    estado: {
        type: String,
        enum: ['Pendiente' , 'Entregada', 'Avalada' , 'Calificada'],
        default: 'Péndiente'
    },
    calificacion: {
        type: Number,
        min : 0, 
        max: 100
    },
    comentarioMaestro: {
        type:String
    },
    fechaEntregada: {
        type: Date,
    },
    padreQueAvaloTarea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    fechaAvalado: {
        type:Date
    },
    fechaCalificado: {
        type:Date
    }
},{
    timestamps: true
});
const EntregaTarea = mongoose.model('EntregaTarea', entregaTareaSchema);
module.exports = EntregaTarea;