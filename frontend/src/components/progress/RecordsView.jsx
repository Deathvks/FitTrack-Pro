import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Calendar, Weight } from 'lucide-react';
import { getPersonalRecords } from '../../services/personalRecordService';

const RecordsView = ({ axisColor }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchRecords();
    }, [currentPage]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await getPersonalRecords(currentPage);
            setRecords(response.records || []);
            setTotalPages(response.totalPages || 1);
            setError(null);
        } catch (err) {
            console.error('Error fetching personal records:', err);
            setError('Error al cargar los récords personales');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getExerciseIcon = (exerciseName) => {
        const name = exerciseName.toLowerCase();
        if (name.includes('press') || name.includes('bench')) {
            return <Weight className="w-5 h-5 text-yellow-800 dark:text-yellow-200" />;
        }
        return <Trophy className="w-5 h-5 text-yellow-800 dark:text-yellow-200" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 dark:text-red-400">{error}</p>
                <button 
                    onClick={fetchRecords}
                    className="mt-4 px-4 py-2 bg-accent text-bg-secondary rounded hover:opacity-90 transition"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Récords Personales
                </h3>
            </div>

            {records.length === 0 ? (
                <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <p className="text-text-secondary">No tienes récords personales registrados aún.</p>
                </div>
            ) : (
                <>
                    {/* Grid responsive: 1 columna en móvil, 2 en tablet, 3 en desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {records.map((record, index) => (
                            <div 
                                key={index}
                                className="bg-bg-secondary rounded-lg p-4 shadow-sm border border-glass-border hover:shadow-md transition-shadow"
                            >
                                {/* Layout: siempre horizontal excepto en móviles muy pequeños */}
                                <div className="flex flex-col xs:flex-row items-start xs:items-center xs:justify-between gap-3">
                                    {/* Información del ejercicio */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0 w-full xs:w-auto">
                                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex-shrink-0">
                                            {getExerciseIcon(record.exercise_name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-text-primary truncate text-sm sm:text-base">
                                                {record.exercise_name}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary">
                                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-text-secondary flex-shrink-0" />
                                                <span className="truncate">{formatDate(record.date)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Peso - a la derecha en la mayoría de resoluciones, centrado solo en móviles muy pequeños */}
                                    <div className="flex justify-center xs:justify-end xs:flex-shrink-0 w-full xs:w-auto">
                                        <div className="text-xl sm:text-2xl font-bold text-accent text-center xs:text-right">
                                            {record.weight_kg}kg
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 sm:gap-4 mt-6">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-bg-secondary text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-transparent hover:text-accent transition border border-glass-border"
                            >
                                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            
                            <span className="text-xs sm:text-sm text-text-secondary px-2">
                                Página {currentPage} de {totalPages}
                            </span>
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-bg-secondary text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-transparent hover:text-accent transition border border-glass-border"
                            >
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RecordsView;