import { create } from 'zustand';
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import * as routineService from '../services/routineService';
import * as workoutService from '../services/workoutService';
import * as bodyweightService from '../services/bodyweightService';


const getFullStateFromStorage = () => {
  try {
    const state = { activeWorkout: null, workoutStartTime: null, isWorkoutPaused: false, workoutAccumulatedTime: 0, isResting: false, restTimerEndTime: null, restTimerInitialDuration: null };
    
    const activeWorkout = JSON.parse(localStorage.getItem('activeWorkout'));
    if (activeWorkout) {
      state.activeWorkout = activeWorkout;
      state.workoutStartTime = JSON.parse(localStorage.getItem('workoutStartTime'));
      state.isWorkoutPaused = JSON.parse(localStorage.getItem('isWorkoutPaused'));
      state.workoutAccumulatedTime = JSON.parse(localStorage.getItem('workoutAccumulatedTime'));
    }

    const isResting = JSON.parse(localStorage.getItem('isResting'));
    const restTimerEndTime = JSON.parse(localStorage.getItem('restTimerEndTime'));
    if (isResting && restTimerEndTime) {
      if (Date.now() > restTimerEndTime) {
        clearRestTimerInStorage();
      } else {
        state.isResting = isResting;
        state.restTimerEndTime = restTimerEndTime;
        state.restTimerInitialDuration = JSON.parse(localStorage.getItem('restTimerInitialDuration'));
      }
    }
    return state;
  } catch {
    clearWorkoutInStorage();
    clearRestTimerInStorage();
    return { activeWorkout: null, workoutStartTime: null, isWorkoutPaused: false, workoutAccumulatedTime: 0, isResting: false, restTimerEndTime: null, restTimerInitialDuration: null };
  }
};

const setWorkoutInStorage = (state) => {
  localStorage.setItem('activeWorkout', JSON.stringify(state.activeWorkout));
  localStorage.setItem('workoutStartTime', JSON.stringify(state.workoutStartTime));
  localStorage.setItem('isWorkoutPaused', JSON.stringify(state.isWorkoutPaused));
  localStorage.setItem('workoutAccumulatedTime', JSON.stringify(state.workoutAccumulatedTime));
};

const clearWorkoutInStorage = () => {
  localStorage.removeItem('activeWorkout');
  localStorage.removeItem('workoutStartTime');
  localStorage.removeItem('isWorkoutPaused');
  localStorage.removeItem('workoutAccumulatedTime');
};

const setRestTimerInStorage = (state) => {
    localStorage.setItem('isResting', JSON.stringify(state.isResting));
    localStorage.setItem('restTimerEndTime', JSON.stringify(state.restTimerEndTime));
    localStorage.setItem('restTimerInitialDuration', JSON.stringify(state.restTimerInitialDuration));
};

const clearRestTimerInStorage = () => {
    localStorage.removeItem('isResting');
    localStorage.removeItem('restTimerEndTime');
    localStorage.removeItem('restTimerInitialDuration');
};

const useAppStore = create((set, get) => ({
  // --- ESTADO ---
  isAuthenticated: !!localStorage.getItem('fittrack_token'),
  token: localStorage.getItem('fittrack_token'),
  userProfile: null,
  routines: [],
  workoutLog: [],
  bodyWeightLog: [],
  isLoading: true,
  prNotification: null,
  ...getFullStateFromStorage(),

  // --- ACCIONES ---
  
  showPRNotification: (newPRs) => {
    set({ prNotification: newPRs });
    setTimeout(() => set({ prNotification: null }), 7000);
  },
  
  handleLogin: async (credentials) => {
    const { token } = await authService.loginUser(credentials);
    localStorage.setItem('fittrack_token', token);
    set({ token, isAuthenticated: true });
    await get().fetchInitialData();
  },

  fetchInitialData: async () => {
    if (!get().token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
    }
    
    set({ isLoading: true });
    try {
      const profileData = await userService.getMyProfile();
      set({ userProfile: profileData, isAuthenticated: true });

      if (profileData.goal) {
        const [routines, workouts, bodyweight] = await Promise.all([
          routineService.getRoutines(),
          workoutService.getWorkouts(),
          bodyweightService.getHistory()
        ]);
        set({
          routines,
          workoutLog: workouts,
          bodyWeightLog: bodyweight,
        });
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
      get().handleLogout();
    } finally {
      set({ isLoading: false });
    }
  },

  handleLogout: async () => {
    localStorage.removeItem('fittrack_token');
    localStorage.removeItem('lastView');
    clearWorkoutInStorage();
    clearRestTimerInStorage();
    set({
      isAuthenticated: false,
      token: null,
      userProfile: null,
      routines: [],
      workoutLog: [],
      bodyWeightLog: [],
      isLoading: false,
      activeWorkout: null,
      workoutStartTime: null,
      isWorkoutPaused: false,
      workoutAccumulatedTime: 0,
      isResting: false,
      restTimerEndTime: null,
      restTimerInitialDuration: null,
    });
  },

  startWorkout: (routine) => {
    const exercises = routine.RoutineExercises || [];
    const sessionTemplate = exercises.map(ex => ({
        ...ex,
        setsDone: Array.from({ length: ex.sets }, (_, i) => ({
            set_number: i + 1,
            reps: '',
            weight_kg: '',
            is_dropset: false,
        }))
    }));

    const newState = {
      activeWorkout: {
        routineId: routine.id,
        routineName: routine.name,
        exercises: sessionTemplate,
      },
      workoutStartTime: null,
      isWorkoutPaused: true,
      workoutAccumulatedTime: 0,
    };
    set(newState);
    setWorkoutInStorage(newState);
  },

  startSimpleWorkout: (workoutName) => {
    const newState = {
      activeWorkout: {
        routineId: null,
        routineName: workoutName,
        exercises: [],
      },
      workoutStartTime: null,
      isWorkoutPaused: true,
      workoutAccumulatedTime: 0,
    };
    set(newState);
    setWorkoutInStorage(newState);
  },

  togglePauseWorkout: () => {
    const { isWorkoutPaused, workoutStartTime, workoutAccumulatedTime } = get();
    let newState;
    
    if (!workoutStartTime) {
      newState = {
        isWorkoutPaused: false,
        workoutStartTime: Date.now(),
      };
    } else if (isWorkoutPaused) {
      newState = {
        isWorkoutPaused: false,
        workoutStartTime: Date.now(),
      };
    } else {
      const elapsed = Date.now() - workoutStartTime;
      newState = {
        isWorkoutPaused: true,
        workoutAccumulatedTime: workoutAccumulatedTime + elapsed,
      };
    }
    set(newState);
    setWorkoutInStorage({ ...get(), ...newState });
  },

  stopWorkout: () => {
    clearWorkoutInStorage();
    clearRestTimerInStorage();
    set({
      activeWorkout: null,
      workoutStartTime: null,
      isWorkoutPaused: false,
      workoutAccumulatedTime: 0,
      isResting: false,
      restTimerEndTime: null,
      restTimerInitialDuration: null,
    });
  },

  updateActiveWorkoutSet: (exIndex, setIndex, field, value) => {
    const session = get().activeWorkout;
    if (!session) return;

    const newExercises = [...session.exercises];
    const parsedValue = value === '' ? '' : parseFloat(value);
    newExercises[exIndex].setsDone[setIndex][field] = isNaN(parsedValue) ? '' : parsedValue;

    const newState = { activeWorkout: { ...session, exercises: newExercises } };
    set(newState);
    setWorkoutInStorage({ ...get(), ...newState });
  },

  addDropset: (exIndex, setIndex) => {
    const session = get().activeWorkout;
    if (!session) return;

    const newExercises = [...session.exercises];
    const targetExercise = newExercises[exIndex];
    const parentSet = targetExercise.setsDone[setIndex];

    const newDropset = {
        set_number: parentSet.set_number,
        reps: '',
        weight_kg: '',
        is_dropset: true,
    };

    targetExercise.setsDone.splice(setIndex + 1, 0, newDropset);
    
    const newState = { activeWorkout: { ...session, exercises: newExercises } };
    set(newState);
    setWorkoutInStorage({ ...get(), ...newState });
  },

  removeDropset: (exIndex, setIndex) => {
    const session = get().activeWorkout;
    if (!session) return;

    const newExercises = [...session.exercises];
    const targetExercise = newExercises[exIndex];

    if (targetExercise.setsDone[setIndex]?.is_dropset) {
        targetExercise.setsDone.splice(setIndex, 1);
    }
    
    const newState = { activeWorkout: { ...session, exercises: newExercises } };
    set(newState);
    setWorkoutInStorage({ ...get(), ...newState });
  },

  // --- INICIO DE LA MODIFICACIÓN ---
  replaceExercise: (exIndex, newExercise) => {
    const session = get().activeWorkout;
    if (!session) return;

    const newExercises = [...session.exercises];
    const oldExercise = newExercises[exIndex];

    // Sustituye el ejercicio manteniendo las series que ya estaban
    newExercises[exIndex] = {
      ...oldExercise, // Mantiene superset_id, order, etc.
      exercise_list_id: newExercise.id,
      name: newExercise.name,
      muscle_group: newExercise.muscle_group,
    };

    const newState = { activeWorkout: { ...session, exercises: newExercises } };
    set(newState);
    setWorkoutInStorage({ ...get(), ...newState });
  },
  // --- FIN DE LA MODIFICACIÓN ---
  
  openRestModal: () => {
    set({ isResting: true });
  },
  
  startRestTimer: (durationInSeconds) => {
    const endTime = Date.now() + durationInSeconds * 1000;
    const newState = {
        isResting: true,
        restTimerEndTime: endTime,
        restTimerInitialDuration: durationInSeconds,
    };
    set(newState);
    setRestTimerInStorage(newState);
  },

  addRestTime: (secondsToAdd) => {
    set((state) => {
      if (!state.restTimerEndTime) return {};

      const newEndTime = state.restTimerEndTime + secondsToAdd * 1000;
      const newInitialDuration = state.restTimerInitialDuration + secondsToAdd;

      if (newEndTime < Date.now() || newInitialDuration <= 0) {
        const finalState = { restTimerEndTime: Date.now() };
        setRestTimerInStorage({ ...state, ...finalState});
        return finalState;
      }
      
      const newState = {
        restTimerEndTime: newEndTime,
        restTimerInitialDuration: newInitialDuration,
      };
      setRestTimerInStorage({ ...state, ...newState });
      return newState;
    });
  },

  resetRestTimer: () => {
    localStorage.removeItem('restTimerEndTime');
    localStorage.removeItem('restTimerInitialDuration');
    set({
      restTimerEndTime: null,
      restTimerInitialDuration: null,
    });
  },

  stopRestTimer: () => {
    clearRestTimerInStorage();
    set({
        isResting: false,
        restTimerEndTime: null,
        restTimerInitialDuration: null,
    });
  },

  logWorkout: async (workoutData) => {
    try {
      const responseData = await workoutService.logWorkout(workoutData);
      if (responseData.newPRs && responseData.newPRs.length > 0) {
        get().showPRNotification(responseData.newPRs);
      }
      get().stopWorkout();
      await get().fetchInitialData(); 
      return { success: true, message: 'Entrenamiento guardado.' };
    } catch (error) {
      return { success: false, message: `Error al guardar: ${error.message}` };
    }
  },
  
  deleteWorkoutLog: async (workoutId) => {
    try {
        await workoutService.deleteWorkout(workoutId);
        await get().fetchInitialData();
        return { success: true, message: 'Entrenamiento eliminado.' };
    } catch (error) {
        return { success: false, message: `Error al eliminar: ${error.message}` };
    }
  },

  updateUserProfile: async (formData) => {
    try {
        await userService.updateUserProfile(formData);
        await get().fetchInitialData();
        return { success: true, message: 'Perfil actualizado.' };
    } catch (error) {
        return { success: false, message: `Error: ${error.message}` };
    }
  },

  logBodyWeight: async (weightData) => {
    try {
        await bodyweightService.logWeight(weightData);
        await get().fetchInitialData();
        return { success: true, message: 'Peso registrado con éxito.' };
    } catch (error) {
        return { success: false, message: `Error al guardar: ${error.message}` };
    }
  },

  updateTodayBodyWeight: async (weightData) => {
    try {
        await bodyweightService.updateTodaysWeight(weightData);
        await get().fetchInitialData();
        return { success: true, message: 'Peso actualizado con éxito.' };
    } catch (error) {
        return { success: false, message: `Error al actualizar: ${error.message}` };
    }
  },
}));

export default useAppStore;