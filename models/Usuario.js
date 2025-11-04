const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true ,
        trim:true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    rol: {
        type: String,
        required: true,
        enum:['Padre de Familia' , 'Estudiante' , 'Maestro' , 'Control Escolar']
    },
    codigoActivacion: {
        type: String
    },
    estadoCuenta: {
        type: String,
        enum: ['Pendiente' , 'Activa'],
        default: 'Pendiente'
    }
},{
    timestamps: true
});

/**
 * Hashear la contraseña antes de guardar si se a modificado.
 */
usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

usuarioSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


const Usuario = mongoose.model('Usuario', usuarioSchema);
module.exports = Usuario;