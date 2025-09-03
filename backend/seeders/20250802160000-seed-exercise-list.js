'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // Verificar si ya existen ejercicios
    const existingExercises = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM exercise_list',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Solo insertar si la tabla está vacía
    if (existingExercises[0].count === 0) {
      await queryInterface.bulkInsert('exercise_list', [
        // Pecho
        { name: 'Press Inclinado con Barra', muscle_group: 'Pecho' },
        { name: 'Press Inclinado con Mancuernas', muscle_group: 'Pecho' },
        { name: 'Press Plano con Barra', muscle_group: 'Pecho' },
        { name: 'Press Plano con Mancuernas', muscle_group: 'Pecho' },
        { name: 'Press Declinado con Barra', muscle_group: 'Pecho' },
        { name: 'Press Declinado con Mancuernas', muscle_group: 'Pecho' },
        { name: 'Aperturas en Banco Inclinado', muscle_group: 'Pecho' },
        { name: 'Aperturas en Banco Declinado', muscle_group: 'Pecho' },
        { name: 'Crossover en Polea', muscle_group: 'Pecho' },
        { name: 'Press en Máquina', muscle_group: 'Pecho' },
        { name: 'Press de Pecho en Máquina Hammer', muscle_group: 'Pecho' },
        
        // Espalda
        { name: 'Jalón al Pecho en Polea', muscle_group: 'Espalda' },
        { name: 'Jalón Trasnuca', muscle_group: 'Espalda' },
        { name: 'Remo con Mancuernas', muscle_group: 'Espalda' },
        { name: 'Remo en Máquina', muscle_group: 'Espalda' },
        { name: 'Remo en Polea Baja', muscle_group: 'Espalda' },
        { name: 'Peso Muerto Rumano', muscle_group: 'Espalda' },
        { name: 'Peso Muerto Sumo', muscle_group: 'Espalda' },
        { name: 'Pull-Over con Mancuerna', muscle_group: 'Espalda' },
        { name: 'Dominadas con Peso', muscle_group: 'Espalda' },
        { name: 'Superman en el Suelo', muscle_group: 'Espalda' },
    
        // Piernas
        { name: 'Sentadilla Frontal con Barra', muscle_group: 'Piernas' },
        { name: 'Sentadilla Hack', muscle_group: 'Piernas' },
        { name: 'Prensa de Piernas Horizontal', muscle_group: 'Piernas' },
        { name: 'Prensa de Piernas Vertical', muscle_group: 'Piernas' },
        { name: 'Extensiones de Cuádriceps', muscle_group: 'Piernas' },
        { name: 'Zancadas Caminando', muscle_group: 'Piernas' },
        { name: 'Zancadas Búlgaras', muscle_group: 'Piernas' },
        { name: 'Step-up con Mancuernas', muscle_group: 'Piernas' },
        { name: 'Curl Femoral Sentado', muscle_group: 'Piernas' },
        { name: 'Peso Muerto con Piernas Rígidas', muscle_group: 'Piernas' },
        { name: 'Sentadilla con Mancuernas', muscle_group: 'Piernas' }, // Este era el duplicado
        { name: 'Sentadilla Goblet', muscle_group: 'Piernas' },
        { name: 'Sentadilla Zercher', muscle_group: 'Piernas' },
        { name: 'Sentadilla en Multipower', muscle_group: 'Piernas' },
        { name: 'Sentadilla Isométrica contra la Pared', muscle_group: 'Piernas' },
        { name: 'Sentadilla Sissy', muscle_group: 'Piernas' },
        { name: 'Sentadilla Pistol (Una Pierna)', muscle_group: 'Piernas' },
        { name: 'Extensión de Piernas Unilateral', muscle_group: 'Piernas' },
        { name: 'Curl Femoral Unilateral', muscle_group: 'Piernas' },
        { name: 'Sentadilla con Salto', muscle_group: 'Piernas' },
        { name: 'Saltos en Caja', muscle_group: 'Piernas' },
        { name: 'Desplantes en Máquina Smith', muscle_group: 'Piernas' },
        { name: 'Desplantes en TRX', muscle_group: 'Piernas' },
        { name: 'Peso Muerto Unilateral', muscle_group: 'Piernas' },
        { name: 'Hack Squat Inverso', muscle_group: 'Piernas' },
        { name: 'Prensa de Piernas Unilateral', muscle_group: 'Piernas' },
        { name: 'Zancadas con Barra', muscle_group: 'Piernas' },
        { name: 'Zancadas en Reversa', muscle_group: 'Piernas' },
        
        // Glúteos
        { name: 'Patada de Glúteo en Máquina', muscle_group: 'Glúteos' },
        { name: 'Elevación de Cadera en Banco', muscle_group: 'Glúteos' },
        { name: 'Abducción de Cadera en Máquina', muscle_group: 'Glúteos' },
        { name: 'Glute Bridge', muscle_group: 'Glúteos' },
        { name: 'Zancadas Laterales', muscle_group: 'Glúteos' },
        { name: 'Hip Thrust con Mancuerna', muscle_group: 'Glúteos' },
        { name: 'Hip Thrust en Máquina', muscle_group: 'Glúteos' },
        { name: 'Elevaciones de Glúteo en Polea', muscle_group: 'Glúteos' },
        { name: 'Glute Kickback en Polea Baja', muscle_group: 'Glúteos' },
        { name: 'Fire Hydrant (Hidratante de Perro)', muscle_group: 'Glúteos' },
        { name: 'Abducción de Cadera en TRX', muscle_group: 'Glúteos' },
        { name: 'Monster Walk con Banda', muscle_group: 'Glúteos' },
        { name: 'Side Step con Banda', muscle_group: 'Glúteos' },
        { name: 'Peso Muerto con Mancuernas para Glúteo', muscle_group: 'Glúteos' },
        { name: 'Glute Bridge con Banda de Resistencia', muscle_group: 'Glúteos' },
        
        // Hombros
        { name: 'Press Arnold', muscle_group: 'Hombros' },
        { name: 'Elevaciones Frontales con Mancuernas', muscle_group: 'Hombros' },
        { name: 'Elevaciones Frontales con Disco', muscle_group: 'Hombros' },
        { name: 'Elevaciones Laterales en Polea', muscle_group: 'Hombros' },
        { name: 'Pájaros con Mancuernas', muscle_group: 'Hombros' },
        { name: 'Face Pull en Polea', muscle_group: 'Hombros' },
        { name: 'Press Militar en Máquina', muscle_group: 'Hombros' },
        { name: 'Encogimientos con Mancuernas', muscle_group: 'Hombros' },
        { name: 'Remo al Cuello con Barra', muscle_group: 'Hombros' },
        { name: 'Press de Hombros en Máquina Hammer', muscle_group: 'Hombros' },
    
        // Brazos (Bíceps)
        { name: 'Curl Martillo', muscle_group: 'Brazos' },
        { name: 'Curl Concentrado', muscle_group: 'Brazos' },
        { name: 'Curl en Banco Scott', muscle_group: 'Brazos' },
        { name: 'Curl en Polea Baja', muscle_group: 'Brazos' },
        { name: 'Curl Zottman', muscle_group: 'Brazos' },
        { name: 'Curl con Barra Z', muscle_group: 'Brazos' },
        { name: 'Curl Alterno de Pie', muscle_group: 'Brazos' },
        { name: 'Curl Araña', muscle_group: 'Brazos' },
        { name: 'Curl de Bíceps en Máquina', muscle_group: 'Brazos' },
    
        // Brazos (Tríceps)
        { name: 'Press Francés con Barra Z', muscle_group: 'Brazos' },
        { name: 'Extensión de Tríceps con Mancuerna', muscle_group: 'Brazos' },
        { name: 'Extensión de Tríceps en Máquina', muscle_group: 'Brazos' },
        { name: 'Extensiones de Tríceps por Encima de la Cabeza', muscle_group: 'Brazos' },
        { name: 'Press Cerrado en Banco Plano', muscle_group: 'Brazos' },
        { name: 'Fondos en Banco', muscle_group: 'Brazos' },
        { name: 'Extensiones de Tríceps a una Mano en Polea', muscle_group: 'Brazos' },
        { name: 'Kickback de Tríceps', muscle_group: 'Brazos' },
        { name: 'Press de Tríceps en Máquina Hammer', muscle_group: 'Brazos' },
        { name: 'Rompecráneos con Barra Z', muscle_group: 'Brazos' },
    
        // Core
        { name: 'Crunch Abdominal', muscle_group: 'Core' },
        { name: 'Crunch en Máquina', muscle_group: 'Core' },
        { name: 'Elevación de Piernas Colgado', muscle_group: 'Core' },
        { name: 'Elevación de Piernas en Banco', muscle_group: 'Core' },
        { name: 'Plancha Abdominal', muscle_group: 'Core' },
        { name: 'Plancha Lateral', muscle_group: 'Core' },
        { name: 'Crunch Bicicleta', muscle_group: 'Core' },
        { name: 'Ab Wheel (Rueda Abdominal)', muscle_group: 'Core' },
        { name: 'Twist Ruso con Disco', muscle_group: 'Core' },
        { name: 'Toes to Bar', muscle_group: 'Core' },
    
        // Cardio
        { name: 'Burpees', muscle_group: 'Cardio' },
        { name: 'Mountain Climbers', muscle_group: 'Cardio' },
        { name: 'Jumping Jacks', muscle_group: 'Cardio' },
        { name: 'Saltar a la Comba', muscle_group: 'Cardio' },
        { name: 'Sprint en Cinta', muscle_group: 'Cardio' },
        { name: 'Battle Ropes', muscle_group: 'Cardio' },
        { name: 'Subida de Escaleras', muscle_group: 'Cardio' },
        { name: 'Bicicleta Estática', muscle_group: 'Cardio' },
    
        // Antebrazo
        { name: 'Curl de Antebrazo con Barra', muscle_group: 'Antebrazo' },
        { name: 'Curl Inverso con Barra Z', muscle_group: 'Antebrazo' },
        { name: 'Rotación de Muñeca con Mancuerna', muscle_group: 'Antebrazo' },
        { name: 'Farmer Walk', muscle_group: 'Antebrazo' },
        { name: 'Wrist Roller', muscle_group: 'Antebrazo' },
    
        // Trapecio
        { name: 'Encogimiento de Hombros con Barra', muscle_group: 'Trapecio' },
        { name: 'Remo Vertical con Mancuernas', muscle_group: 'Trapecio' },
        { name: 'Shrugs en Máquina', muscle_group: 'Trapecio' },
    
      ], {});
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('exercise_list', null, {});
  }
};