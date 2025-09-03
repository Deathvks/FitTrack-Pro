'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const templates = [
      // 1. GANANCIA MUSCULAR (PRIMERO)
      {
        category: 'Ganancia Muscular',
        routines: [
          {
            name: 'Día 1: Pecho, Hombros y Tríceps',
            description: 'Entrenamiento de empuje enfocado en pecho, hombros y tríceps para maximizar la hipertrofia.',
            exercises: [
              { name: 'Press de Banca Plano', sets: 4, reps: '6-8' },
              { name: 'Press Inclinado con Mancuernas', sets: 4, reps: '8-10' },
              { name: 'Press Militar con Barra', sets: 4, reps: '6-8' },
              { name: 'Elevaciones Laterales con Mancuernas', sets: 4, reps: '12-15' },
              { name: 'Fondos en Paralelas', sets: 3, reps: 'Al fallo' },
              { name: 'Extensiones de Tríceps en Polea', sets: 4, reps: '10-12' },
              { name: 'Press Francés con Barra Z', sets: 3, reps: '10-12' },
            ]
          },
          {
            name: 'Día 2: Espalda, Bíceps y Antebrazo',
            description: 'Entrenamiento de tracción enfocado en espalda, bíceps y antebrazos para desarrollo completo.',
            exercises: [
              { name: 'Dominadas con Peso', sets: 4, reps: '6-8' },
              { name: 'Remo con Barra', sets: 4, reps: '6-8' },
              { name: 'Remo con Mancuerna', sets: 4, reps: '8-10' },
              { name: 'Jalones en Polea', sets: 3, reps: '10-12' },
              { name: 'Curl de Bíceps con Barra', sets: 4, reps: '8-10' },
              { name: 'Curl Martillo con Mancuernas', sets: 4, reps: '10-12' },
              { name: 'Curl de Antebrazo con Barra', sets: 3, reps: '15-20' },
            ]
          },
          {
            name: 'Día 3: Piernas Completas',
            description: 'Entrenamiento completo de piernas enfocado en cuádriceps, femorales, glúteos y gemelos.',
            exercises: [
              { name: 'Sentadilla con Barra', sets: 4, reps: '6-8' },
              { name: 'Peso Muerto Rumano', sets: 4, reps: '6-8' },
              { name: 'Prensa de Piernas', sets: 4, reps: '10-12' },
              { name: 'Curl Femoral Acostado', sets: 4, reps: '10-12' },
              { name: 'Extensiones de Cuádriceps', sets: 4, reps: '12-15' },
              { name: 'Elevaciones de Gemelos', sets: 4, reps: '15-20' },
            ]
          },
          {
            name: 'Día 4: Pecho, Hombros y Tríceps (Variante)',
            description: 'Segunda sesión de empuje con variaciones diferentes para estimular el crecimiento muscular.',
            exercises: [
              { name: 'Press Inclinado con Barra', sets: 4, reps: '8-10' },
              { name: 'Aperturas con Mancuernas', sets: 4, reps: '10-12' },
              { name: 'Press con Mancuernas Sentado', sets: 4, reps: '8-10' },
              { name: 'Elevaciones Posteriores', sets: 4, reps: '12-15' },
              { name: 'Dips en Máquina', sets: 3, reps: '10-12' },
              { name: 'Extensiones de Tríceps con Mancuerna', sets: 4, reps: '10-12' },
            ]
          },
          {
            name: 'Día 5: Espalda, Bíceps y Antebrazo (Variante)',
            description: 'Segunda sesión de tracción con enfoque en volumen y variaciones de ejercicios.',
            exercises: [
              { name: 'Peso Muerto Convencional', sets: 4, reps: '5-6' },
              { name: 'Remo en Polea Baja', sets: 4, reps: '8-10' },
              { name: 'Jalones con Agarre Cerrado', sets: 4, reps: '10-12' },
              { name: 'Remo en Máquina', sets: 3, reps: '12-15' },
              { name: 'Curl Concentrado', sets: 4, reps: '10-12 c/u' },
              { name: 'Curl en Polea Baja', sets: 4, reps: '12-15' },
              { name: 'Curl Inverso con Barra', sets: 3, reps: '12-15' },
            ]
          }
        ]
      },

      // 2. PÉRDIDA DE GRASA (SEGUNDO)
      {
        category: 'Pérdida de Grasa',
        routines: [
          {
            name: 'Día 1: Pecho y Cardio Metabólico',
            description: 'Entrenamiento de pecho combinado con ejercicios metabólicos para maximizar la quema de calorías.',
            exercises: [
              { name: 'Press de Banca Plano', sets: 4, reps: '12-15' },
              { name: 'Press Inclinado con Mancuernas', sets: 4, reps: '15-20' },
              { name: 'Aperturas con Mancuernas', sets: 3, reps: '15-20' },
              { name: 'Fondos en Paralelas', sets: 3, reps: 'Al fallo' },
              { name: 'Burpees', sets: 4, reps: '12-15' },
              { name: 'Mountain Climbers', sets: 4, reps: '30s' },
              { name: 'Jumping Jacks', sets: 3, reps: '45s' },
            ]
          },
          {
            name: 'Día 2: Espalda y HIIT',
            description: 'Entrenamiento de espalda combinado con intervalos de alta intensidad.',
            exercises: [
              { name: 'Dominadas o Jalones', sets: 4, reps: '12-15' },
              { name: 'Remo con Barra', sets: 4, reps: '15-20' },
              { name: 'Remo con Mancuerna', sets: 4, reps: '15-20 c/u' },
              { name: 'Remo en Polea Baja', sets: 3, reps: '20-25' },
              { name: 'Kettlebell Swings', sets: 4, reps: '20-25' },
              { name: 'Battle Ropes', sets: 4, reps: '30s' },
              { name: 'Sprints en Cinta', sets: 5, reps: '30s' },
            ]
          },
          {
            name: 'Día 3: Piernas y Pliométricos',
            description: 'Entrenamiento de piernas con ejercicios explosivos para maximizar el gasto calórico.',
            exercises: [
              { name: 'Sentadilla con Barra', sets: 4, reps: '15-20' },
              { name: 'Peso Muerto Rumano', sets: 4, reps: '15-20' },
              { name: 'Sentadilla con Salto', sets: 4, reps: '15-20' },
              { name: 'Zancadas con Salto', sets: 4, reps: '12-15' },
              { name: 'Extensiones de Cuádriceps', sets: 4, reps: '20-25' },
              { name: 'Curl Femoral', sets: 4, reps: '20-25' },
              { name: 'Box Jumps', sets: 4, reps: '10-12' },
              { name: 'Wall Sits', sets: 3, reps: '45-60s' },
            ]
          },
          {
            name: 'Día 4: Hombros y Circuito',
            description: 'Entrenamiento de hombros con circuitos metabólicos de alta intensidad.',
            exercises: [
              { name: 'Press Militar con Mancuernas', sets: 4, reps: '15-20' },
              { name: 'Elevaciones Laterales', sets: 4, reps: '20-25' },
              { name: 'Elevaciones Posteriores', sets: 4, reps: '20-25' },
              { name: 'Elevaciones Frontales', sets: 3, reps: '15-20' },
              { name: 'Thrusters con Mancuernas', sets: 4, reps: '12-15' },
              { name: 'Burpees con Press', sets: 4, reps: '10-12' },
              { name: 'Plancha con Toque de Hombro', sets: 3, reps: '20 c/lado' },
            ]
          },
          {
            name: 'Día 5: Full Body Metabólico',
            description: 'Entrenamiento metabólico de cuerpo completo para finalizar la semana.',
            exercises: [
              { name: 'Burpees', sets: 5, reps: '10-15' },
              { name: 'Sentadilla con Salto', sets: 5, reps: '20' },
              { name: 'Flexiones', sets: 4, reps: '15-20' },
              { name: 'Mountain Climbers', sets: 4, reps: '45s' },
              { name: 'Jumping Jacks', sets: 4, reps: '60s' },
              { name: 'High Knees', sets: 4, reps: '30s' },
              { name: 'Plancha Abdominal', sets: 4, reps: '60-90s' },
              { name: 'Russian Twists', sets: 4, reps: '30-40' },
              { name: 'Bicycle Crunches', sets: 4, reps: '20 c/lado' },
            ]
          }
        ]
      },

      // 3. MEJORES RUTINAS DE PECHO
      {
        category: 'Mejores Rutinas de Pecho',
        routines: [
          {
            name: 'Pecho Completo - Masa',
            description: 'Los mejores ejercicios para desarrollar un pecho completo y voluminoso.',
            exercises: [
              { name: 'Press de Banca Plano con Barra', sets: 4, reps: '6-8' },
              { name: 'Press Inclinado con Mancuernas', sets: 4, reps: '8-10' },
              { name: 'Press Declinado con Barra', sets: 3, reps: '8-12' },
              { name: 'Aperturas con Mancuernas', sets: 3, reps: '10-12' },
              { name: 'Fondos en Paralelas', sets: 3, reps: 'Al fallo' },
              { name: 'Pullover con Mancuerna', sets: 3, reps: '12-15' },
            ]
          },
          {
            name: 'Pecho Definición',
            description: 'Rutina de pecho enfocada en la definición muscular y el detalle.',
            exercises: [
              { name: 'Press Inclinado con Mancuernas', sets: 4, reps: '12-15' },
              { name: 'Aperturas Inclinadas con Mancuernas', sets: 4, reps: '12-15' },
              { name: 'Cruces en Polea Alta', sets: 4, reps: '15-20' },
              { name: 'Press en Máquina Inclinado', sets: 3, reps: '12-15' },
              { name: 'Fondos Asistidos', sets: 3, reps: '15-20' },
            ]
          },
          {
            name: 'Pecho Potencia y Fuerza',
            description: 'Rutina de pecho enfocada en el desarrollo de fuerza máxima y potencia.',
            exercises: [
              { name: 'Press de Banca Plano', sets: 5, reps: '3-5' },
              { name: 'Press Inclinado con Barra', sets: 4, reps: '5-6' },
              { name: 'Flexiones Pliométricas', sets: 4, reps: '8-10' },
              { name: 'Press con Mancuernas Pesadas', sets: 4, reps: '6-8' },
              { name: 'Fondos con Peso', sets: 3, reps: '8-10' },
            ]
          }
        ]
      },

      // 4. MEJORES RUTINAS DE ESPALDA
      {
        category: 'Mejores Rutinas de Espalda',
        routines: [
          {
            name: 'Espalda Completa - Masa',
            description: 'Los mejores ejercicios para desarrollar una espalda ancha y gruesa.',
            exercises: [
              { name: 'Peso Muerto Convencional', sets: 4, reps: '5-6' },
              { name: 'Dominadas con Peso', sets: 4, reps: '6-8' },
              { name: 'Remo con Barra', sets: 4, reps: '6-8' },
              { name: 'Remo con Mancuerna', sets: 4, reps: '8-10 c/u' },
              { name: 'Jalones en Polea', sets: 3, reps: '10-12' },
              { name: 'Remo en Polea Baja', sets: 3, reps: '10-12' },
            ]
          },
          {
            name: 'Espalda Definición y Detalle',
            description: 'Rutina de espalda enfocada en la definición y el detalle muscular.',
            exercises: [
              { name: 'Jalones con Agarre Ancho', sets: 4, reps: '12-15' },
              { name: 'Remo en Polea Baja con Agarre Cerrado', sets: 4, reps: '12-15' },
              { name: 'Jalones con Agarre Inverso', sets: 4, reps: '12-15' },
              { name: 'Remo en Máquina Unilateral', sets: 4, reps: '15-20 c/u' },
              { name: 'Pullover en Polea Alta', sets: 3, reps: '15-20' },
              { name: 'Hiperextensiones', sets: 3, reps: '15-20' },
            ]
          },
          {
            name: 'Espalda Potencia y Fuerza',
            description: 'Rutina de espalda enfocada en el desarrollo de fuerza máxima y potencia.',
            exercises: [
              { name: 'Peso Muerto Convencional', sets: 5, reps: '3-5' },
              { name: 'Dominadas Lastradas', sets: 4, reps: '5-6' },
              { name: 'Remo con Barra Pendlay', sets: 4, reps: '5-6' },
              { name: 'Remo con Mancuerna Pesada', sets: 4, reps: '6-8 c/u' },
              { name: 'Jalones con Peso Máximo', sets: 4, reps: '6-8' },
            ]
          }
        ]
      },

      // 5. PIERNAS - ENFOQUE CUÁDRICEPS
      {
        category: 'Piernas - Enfoque Cuádriceps',
        routines: [
          {
            name: 'Cuádriceps Dominante',
            description: 'Rutina especializada para el desarrollo máximo de los cuádriceps.',
            exercises: [
              { name: 'Sentadilla Frontal', sets: 4, reps: '6-8' },
              { name: 'Sentadilla con Barra Alta', sets: 4, reps: '8-10' },
              { name: 'Prensa de Piernas', sets: 4, reps: '12-15' },
              { name: 'Extensiones de Cuádriceps', sets: 4, reps: '15-20' },
              { name: 'Sentadilla Búlgara', sets: 3, reps: '10-12' },
              { name: 'Zancadas Caminando', sets: 3, reps: '12-15' },
            ]
          },
          {
            name: 'Cuádriceps Volumen',
            description: 'Rutina de alto volumen para maximizar la hipertrofia de cuádriceps.',
            exercises: [
              { name: 'Sentadilla con Barra', sets: 5, reps: '10-12' },
              { name: 'Prensa de Piernas', sets: 4, reps: '15-20' },
              { name: 'Extensiones de Cuádriceps', sets: 5, reps: '20-25' },
              { name: 'Sentadilla Hack', sets: 4, reps: '12-15' },
              { name: 'Zancadas en Máquina Smith', sets: 4, reps: '12-15' },
            ]
          }
        ]
      },

      // 6. PIERNAS - ENFOQUE GLÚTEOS
      {
        category: 'Piernas - Enfoque Glúteos',
        routines: [
          {
            name: 'Glúteos Dominante',
            description: 'Rutina especializada para el desarrollo y fortalecimiento de los glúteos.',
            exercises: [
              { name: 'Peso Muerto Rumano', sets: 4, reps: '8-10' },
              { name: 'Hip Thrust con Barra', sets: 4, reps: '10-12' },
              { name: 'Sentadilla Sumo', sets: 4, reps: '10-12' },
              { name: 'Peso Muerto con Mancuernas', sets: 3, reps: '12-15' },
              { name: 'Patadas de Glúteo en Polea', sets: 4, reps: '15-20' },
              { name: 'Caminata Lateral con Banda', sets: 3, reps: '20 c/lado' },
            ]
          },
          {
            name: 'Glúteos y Femorales',
            description: 'Combinación perfecta para desarrollar la cadena posterior.',
            exercises: [
              { name: 'Peso Muerto Convencional', sets: 4, reps: '6-8' },
              { name: 'Hip Thrust con Barra', sets: 4, reps: '8-12' },
              { name: 'Curl Femoral Acostado', sets: 4, reps: '12-15' },
              { name: 'Buenos Días con Barra', sets: 3, reps: '10-12' },
              { name: 'Hiperextensiones', sets: 3, reps: '15-20' },
              { name: 'Puente de Glúteo a Una Pierna', sets: 3, reps: '12-15' },
            ]
          }
        ]
      },

      // 7. MEJORES RUTINAS DE ABDOMINALES
      {
        category: 'Mejores Rutinas de Abdominales',
        routines: [
          {
            name: 'Abdominales Principiante',
            description: 'Rutina básica para desarrollar fuerza abdominal desde cero con ejercicios fundamentales.',
            exercises: [
              { name: 'Plancha Abdominal', sets: 3, reps: '30-45s' },
              { name: 'Crunch Abdominal', sets: 3, reps: '15-20' },
              { name: 'Elevación de Piernas en Banco', sets: 3, reps: '10-15' },
              { name: 'Plancha Lateral', sets: 2, reps: '20-30s c/lado' },
              { name: 'Dead Bug', sets: 3, reps: '10-12 c/lado' },
              { name: 'Bird Dog', sets: 3, reps: '10-12 c/lado' },
            ]
          },
          {
            name: 'Abdominales Intermedio',
            description: 'Rutina intermedia para fortalecer el core con mayor intensidad y variedad de movimientos.',
            exercises: [
              { name: 'Plancha Abdominal', sets: 4, reps: '45-60s' },
              { name: 'Crunch Bicicleta', sets: 4, reps: '20-25 c/lado' },
              { name: 'Elevación de Piernas Colgado', sets: 3, reps: '12-15' },
              { name: 'Russian Twists', sets: 4, reps: '25-30' },
              { name: 'Mountain Climbers', sets: 3, reps: '30-40' },
              { name: 'Plancha con Toque de Hombro', sets: 3, reps: '20-24' },
              { name: 'V-Ups', sets: 3, reps: '12-15' },
            ]
          },
          {
            name: 'Abdominales Avanzado',
            description: 'Rutina avanzada de alta intensidad para desarrollar un core fuerte y definido.',
            exercises: [
              { name: 'Toes to Bar', sets: 4, reps: '10-15' },
              { name: 'Ab Wheel (Rueda Abdominal)', sets: 4, reps: '12-18' },
              { name: 'Dragon Flag', sets: 3, reps: '6-10' },
              { name: 'L-Sit Hold', sets: 3, reps: '20-30s' },
              { name: 'Windshield Wipers', sets: 3, reps: '12-15 c/lado' },
              { name: 'Hollow Body Hold', sets: 3, reps: '30-45s' },
              { name: 'Pistol Squat', sets: 3, reps: '8-12 c/lado' },
            ]
          },
          {
            name: 'Abdominales Funcional',
            description: 'Rutina funcional que combina fuerza abdominal con movimientos dinámicos y estabilidad.',
            exercises: [
              { name: 'Plancha con Elevación de Pierna', sets: 3, reps: '12-15 c/lado' },
              { name: 'Bear Crawl', sets: 3, reps: '20-30s' },
              { name: 'Turkish Get-Up', sets: 3, reps: '5-8 c/lado' },
              { name: 'Farmer Walk', sets: 3, reps: '30-40s' },
              { name: 'Pallof Press', sets: 3, reps: '12-15 c/lado' },
              { name: 'Suitcase Carry', sets: 3, reps: '30s c/lado' },
              { name: 'Anti-Rotación con Banda', sets: 3, reps: '15-20 c/lado' },
            ]
          },
          {
            name: 'Abdominales Definición',
            description: 'Rutina específica para definir y marcar los abdominales con alto volumen y variedad.',
            exercises: [
              { name: 'Crunch en Máquina', sets: 4, reps: '15-20' },
              { name: 'Crunch Inverso', sets: 4, reps: '15-20' },
              { name: 'Crunch Oblicuo', sets: 4, reps: '15-20 c/lado' },
              { name: 'Plancha Lateral Dinámica', sets: 3, reps: '12-15 c/lado' },
              { name: 'Scissor Kicks', sets: 4, reps: '20-30' },
              { name: 'Flutter Kicks', sets: 4, reps: '30-40' },
              { name: 'Leg Raises', sets: 4, reps: '15-20' },
              { name: 'Bicycle Crunches', sets: 4, reps: '25-30 c/lado' },
            ]
          },
          {
            name: 'Core Explosivo',
            description: 'Rutina de core explosivo que combina fuerza y potencia para atletas y deportistas.',
            exercises: [
              { name: 'Medicine Ball Slams', sets: 4, reps: '12-15' },
              { name: 'Rotational Medicine Ball Throws', sets: 4, reps: '10-12 c/lado' },
              { name: 'Explosive Push-Up to T', sets: 3, reps: '8-12' },
              { name: 'Burpee to Tuck Jump', sets: 4, reps: '8-12' },
              { name: 'Plank Up-Downs', sets: 3, reps: '12-16' },
              { name: 'Jump Squats con Twist', sets: 4, reps: '15-20' },
              { name: 'Battle Ropes', sets: 3, reps: '30s' },
            ]
          }
        ]
      },
    ];

    const t = await queryInterface.sequelize.transaction();
    try {
      for (const category of templates) {
        for (const routine of category.routines) {
          await queryInterface.bulkInsert('template_routines', [{
            name: routine.name,
            description: routine.description,
            category: category.category,
          }], { transaction: t });

          const [[{ id: routineId }]] = await queryInterface.sequelize.query(
            'SELECT LAST_INSERT_ID() as id;',
            { transaction: t }
          );
          
          const exercisesToInsert = routine.exercises.map(ex => ({
            template_routine_id: routineId,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
          }));

          await queryInterface.bulkInsert('template_routine_exercises', exercisesToInsert, { transaction: t });
        }
      }
      await t.commit();
    } catch (error) {
      await t.rollback();
      console.error('Error durante el seeder de rutinas predefinidas:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('template_routine_exercises', null, {});
    await queryInterface.bulkDelete('template_routines', null, {});
  }
};