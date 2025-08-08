import React, { useState, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import useAppStore from '../store/useAppStore';
import { searchExercises } from '../services/exerciseService';
import Spinner from '../components/Spinner';

const ExerciseReplaceModal = ({ exerciseIndex, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { replaceExercise } = useAppStore(state => ({
        replaceExercise: state.replaceExercise,
    }));

    const handleSelect = (newExercise) => {
        replaceExercise(exerciseIndex, newExercise);
        onClose();
    };

    // --- INICIO DE LA MODIFICACIÓN ---
    // Función para guardar el texto actual como un nuevo ejercicio personalizado
    const handleSaveCustom = () => {
        if (searchTerm.trim()) {
            handleSelect({
                id: null, // No tiene ID de la base de datos
                name: searchTerm.trim(),
                muscle_group: '', // El usuario lo puede editar después si quiere
            });
        }
    };
    // --- FIN DE LA MODIFICACIÓN ---

    useEffect(() => {
        if (searchTerm.length < 2) {
            setResults([]);
            return;
        }

        const handler = setTimeout(async () => {
            setIsLoading(true);
            try {
                const data = await searchExercises(searchTerm);
                setResults(data);
            } catch (error) {
                console.error(error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
            onClick={onClose}
        >
            <GlassCard 
                className="relative w-full max-w-md p-8 m-4 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition">
                    <X size={20} />
                </button>
                <h3 className="text-xl font-bold text-center mb-6">Sustituir Ejercicio</h3>
                
                <input
                    type="text"
                    placeholder="Buscar o escribir ejercicio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.replace(/[0-9]/g, ''))}
                    className="w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition"
                    autoFocus
                />

                <div className="mt-4 max-h-[40vh] overflow-y-auto flex flex-col gap-2">
                    {isLoading && (
                        <div className="flex justify-center p-4">
                            <Spinner />
                        </div>
                    )}
                    {!isLoading && results.length > 0 && (
                        results.map(ex => (
                            <button
                                key={ex.id}
                                onClick={() => handleSelect(ex)}
                                className="block w-full text-left p-3 rounded-md bg-bg-secondary hover:bg-accent-transparent transition-colors"
                            >
                                {ex.name} <span className="text-xs text-text-muted">({ex.muscle_group})</span>
                            </button>
                        ))
                    )}
                    
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    {!isLoading && searchTerm.length >= 2 && (
                        <div className="pt-2 mt-2 border-t border-glass-border">
                            <button
                                onClick={handleSaveCustom}
                                className="flex items-center justify-center gap-2 w-full p-3 rounded-md bg-accent/10 text-accent font-semibold hover:bg-accent/20 transition-colors"
                            >
                                <PlusCircle size={18} />
                                <span>Guardar como nuevo ejercicio</span>
                            </button>
                        </div>
                    )}
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                </div>
            </GlassCard>
        </div>
    );
};

export default ExerciseReplaceModal;