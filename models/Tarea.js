const mongoose = require('mongoose');
const { Schema } = mongoose;

const tareaSchema = new Schema({
    materia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Materia',
        required: true,
    },
    titulo: {
        type: String,
        required: true,
        trim : true
    },
    descripcion: {
        type: String,
        required: true
    },
    fechaVencimiento: {
        type: Date,
        required: true
    },
    requiereAval: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});


const Tarea = mongoose.model('Tarea', tareaSchema);
module.exports = Tarea;