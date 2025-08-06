export const calculateCalories = (durationInSeconds, userWeight = 75) => {
  const MET_VALUE = 5.0;
  const hours = durationInSeconds / 3600;
  return Math.round(MET_VALUE * userWeight * hours);
};

export const getBestSet = (sets) => {
  if (!sets || sets.length === 0) {
    return { weight_kg: 0, reps: 0 };
  }

  let bestSet = sets[0];

  for (let i = 1; i < sets.length; i++) {
    const currentSet = sets[i];
    const currentWeight = parseFloat(currentSet.weight_kg) || 0;
    const bestWeight = parseFloat(bestSet.weight_kg) || 0;

    if (currentWeight > bestWeight) {
      bestSet = currentSet;
    }
  }

  return bestSet;
};

// --- FUNCIÓN AÑADIDA ---
export const isSameDay = (dateA, dateB) => {
    const date1 = new Date(dateA);
    const date2 = new Date(dateB);
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};