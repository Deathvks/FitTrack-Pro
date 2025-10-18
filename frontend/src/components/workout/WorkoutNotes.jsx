import React from 'react';
import { FileText } from 'lucide-react';
import GlassCard from '../GlassCard';

/**
 * Muestra el área de texto para añadir notas a la sesión de entrenamiento.
 */
const WorkoutNotes = ({ notes, setNotes, hasWorkoutStarted }) => {
    return (
        <GlassCard className="p-6 mt-6">
            <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
                <FileText size={20} />
                Notas de la Sesión
            </h2>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={hasWorkoutStarted ? "¿Cómo te sentiste? ¿Alguna observación?..." : "Inicia el cronómetro para añadir notas..."}
                className={`w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition resize-none ${
                    !hasWorkoutStarted ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                rows={4}
                disabled={!hasWorkoutStarted}
                readOnly={!hasWorkoutStarted} // readOnly previene cambios pero permite selección y scroll
            />
        </GlassCard>
    );
};

export default WorkoutNotes;