const mongoose = require('mongoose');
/**
 * Schema de relacion, 
 */
//Cambio de nombre.
const padreHijoSchema = new mongoose.Schema({
    padre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    hijo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estudiante',
        required: true
    }
});

//Index para ligar padre con  hijo
padreHijoSchema.index({ padre: 1, hijo: 1 }, { unique: true });
const PadreHijo = mongoose.model('PadreHijo', padreHijoSchema);
module.exports = PadreHijo;