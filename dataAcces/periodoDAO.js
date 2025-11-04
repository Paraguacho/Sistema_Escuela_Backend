const PeriodoEvaluacion = require('../models/Periodo.js');

class PeriodoDAO {

    /**
     * Crea un nuevo periodo de evaluación.
     * @param {object} datosPeriodo - { nombre, fechaInicio, fechaFin, fechaLimiteCalificaciones }
     * @returns {Promise<object>} El documento del periodo creado.
     */
    static async crearPeriodo(datosPeriodo) {
        try {
            const periodo = new PeriodoEvaluacion(datosPeriodo);
            return await periodo.save();
        } catch (error) {
            throw new Error(`Error al crear el periodo: ${error.message}`);
        }
    }

    /**
     * Busca el periodo de evaluación activo (actual).
     * @returns {Promise<object|null>} El documento del periodo activo.
     */
    static async buscarPeriodoActivo() {
    try {
        const hoy = new Date();
        const hoyInicioDelDia = new Date(hoy.setHours(0, 0, 0, 0)); 
        
        const query = {
            fechaInicio: { $lte: hoyInicioDelDia }, // El periodo debe haber empezado ya
            fechaFinal: { $gte: hoyInicioDelDia }  // Y no debe haber terminado aún
        };
        
        const periodo = await PeriodoEvaluacion.findOne(query);
        return periodo;

        } catch (error) {
            throw new Error(`Error al buscar el periodo activo: ${error.message}`);
        }
    }
}

module.exports = PeriodoDAO;