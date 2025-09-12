import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, TrendingUp, Zap, Save, Trash2, Edit } from 'lucide-react';
import GlassCard from './GlassCard';
import { useToast } from '../hooks/useToast';
import * as creatinaService from '../services/creatinaService';
import { formatDateForDisplay, formatDateToShort } from '../utils/dateUtils';
import ConfirmationModal from './ConfirmationModal';

const CreatinaTracker = ({ onClose, selectedDate }) => {
    const { addToast } = useToast();
    const [creatinaLogs, setCreatinaLogs] = useState([]);
    const [dailyLogs, setDailyLogs] = useState([]);
    const [grams, setGrams] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [editGrams, setEditGrams] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);
    const [stats, setStats] = useState({
        totalDays: 0,
        currentStreak: 0,
        averageGrams: 0,
        thisWeekDays: 0
    });

    useEffect(() => {
        fetchCreatinaData();
        setGrams(''); // Limpiar el input al cambiar de día
    }, [selectedDate]);

    const fetchCreatinaData = async () => {
        setIsLoading(true);
        try {
            const [logsResponse, statsResponse, dailyLogsResponse] = await Promise.all([
                creatinaService.getCreatinaLogs(),
                creatinaService.getCreatinaStats(),
                creatinaService.getCreatinaLogs({ startDate: selectedDate, endDate: selectedDate })
            ]);
            
            setCreatinaLogs(logsResponse.data || []);
            setStats(statsResponse.data || stats);
            setDailyLogs(dailyLogsResponse.data || []);

        } catch (error) {
            console.error('Error fetching creatina data:', error);
            addToast('Error al cargar los datos de creatina', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const gramsValue = parseFloat(grams);
        if (isNaN(gramsValue) || gramsValue <= 0) {
            addToast('Por favor ingresa una cantidad válida de gramos', 'error');
            return;
        }
    
        setIsSubmitting(true);
        try {
            await creatinaService.createCreatinaLog({
                grams: gramsValue,
                log_date: selectedDate
            });
            addToast('Registro de creatina guardado', 'success');
            setGrams('');
            await fetchCreatinaData();
        } catch (error) {
            addToast(error.message || 'Error al guardar el registro', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const getStreakColor = (streak) => {
        if (streak >= 30) return 'text-green-400';
        if (streak >= 14) return 'text-blue-400';
        if (streak >= 7) return 'text-yellow-400';
        return 'text-gray-400';
    };

    useEffect(() => {
        // Bloquea el scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';
        
        // Función de limpieza para restaurar el scroll cuando el modal se cierra
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleEditLog = (log) => {
        setEditingLog(log);
        setEditGrams(log.grams.toString());
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingLog(null);
        setEditGrams('');
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        
        if (!editGrams || editGrams.trim() === '') {
            addToast('Por favor ingresa una cantidad de gramos', 'error');
            return;
        }
        
        const gramsValue = parseFloat(editGrams);
        if (isNaN(gramsValue) || gramsValue <= 0) {
            addToast('Por favor ingresa una cantidad válida de gramos', 'error');
            return;
        }
    
        setIsSubmitting(true);
        try {
            await creatinaService.updateCreatinaLog(editingLog.id, {
                grams: gramsValue
            });
            addToast('Registro actualizado correctamente', 'success');
            handleCloseEditModal();
            await fetchCreatinaData();
        } catch (error) {
            console.error('Error updating creatina log:', error);
            addToast('Error al actualizar el registro', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (log) => {
        setLogToDelete(log);
    };

    const confirmDelete = async () => {
        if (!logToDelete) return;

        setIsSubmitting(true);
        try {
            await creatinaService.deleteCreatinaLog(logToDelete.id);
            addToast('Registro eliminado correctamente', 'success');
            await fetchCreatinaData();
        } catch (error) {
            console.error('Error deleting creatina log:', error);
            addToast('Error al eliminar el registro', 'error');
        } finally {
            setIsSubmitting(false);
            setLogToDelete(null);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
                <div className="bg-bg-primary rounded-2xl border border-glass-border max-w-5xl w-full max-h-[95vh] flex flex-col">
                    <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-glass-border">
                        <div className="flex items-center gap-3">
                            <Zap className="text-accent" size={28} />
                            <h2 className="text-xl sm:text-2xl font-bold">Seguimiento de Creatina</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors"><X size={24} /></button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 sm:p-6">
                        <div className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                <GlassCard className="p-3 sm:p-4 text-center"><div className="flex items-center justify-center mb-2"><Calendar className="text-blue-400" size={24} /></div><p className="text-xl sm:text-2xl font-bold">{stats.totalDays}</p><p className="text-xs sm:text-sm text-text-muted">Días totales</p></GlassCard>
                                <GlassCard className="p-3 sm:p-4 text-center"><div className="flex items-center justify-center mb-2"><TrendingUp className={getStreakColor(stats.currentStreak)} size={24} /></div><p className={`text-xl sm:text-2xl font-bold ${getStreakColor(stats.currentStreak)}`}>{stats.currentStreak}</p><p className="text-xs sm:text-sm text-text-muted">Racha actual</p></GlassCard>
                                <GlassCard className="p-3 sm:p-4 text-center"><div className="flex items-center justify-center mb-2"><Zap className="text-accent" size={24} /></div><p className="text-xl sm:text-2xl font-bold">{stats.averageGrams.toFixed(1)}g</p><p className="text-xs sm:text-sm text-text-muted">Promedio</p></GlassCard>
                                <GlassCard className="p-3 sm:p-4 text-center"><div className="flex items-center justify-center mb-2"><Calendar className="text-green-400" size={24} /></div><p className="text-xl sm:text-2xl font-bold">{stats.thisWeekDays}/7</p><p className="text-xs sm:text-sm text-text-muted">Esta semana</p></GlassCard>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <GlassCard className="p-4 sm:p-6">
                                    <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2"><Calendar size={20} />{formatDateForDisplay(selectedDate)}</h3>
                                    {dailyLogs.length < 2 ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Añadir nueva toma ({dailyLogs.length + 1} de 2)</label>
                                                <input type="number" step="0.1" min="0.1" max="50" value={grams} onChange={(e) => setGrams(e.target.value)} className="w-full px-4 py-2 bg-bg-secondary border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Ej: 5.0" disabled={isSubmitting} />
                                            </div>
                                            <div className="flex gap-3">
                                                <button type="submit" disabled={isSubmitting || !grams} className="flex items-center gap-2 px-4 py-2 bg-accent text-bg-secondary rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Plus size={16} />{isSubmitting ? 'Guardando...' : 'Añadir Toma'}</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="text-center py-6"><p className="font-semibold">Límite diario alcanzado</p><p className="text-sm text-text-muted">Has registrado las 2 tomas de hoy.</p></div>
                                    )}
                                </GlassCard>

                                <GlassCard className="p-4 sm:p-6">
                                    <h3 className="text-lg sm:text-xl font-bold mb-4">Historial Reciente</h3>
                                    {isLoading ? (
                                        <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div><p className="text-text-muted mt-2">Cargando...</p></div>
                                    ) : creatinaLogs.length > 0 ? (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                            {creatinaLogs.map((log) => (
                                                <div key={log.id} className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg border border-glass-border">
                                                    <div>
                                                        <p className="font-medium text-sm sm:text-base">{formatDateToShort(log.log_date)}</p>
                                                        <p className="text-xs sm:text-sm text-text-muted">{new Date(log.log_date).toLocaleDateString('es-ES', { weekday: 'long' })}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-accent text-sm sm:text-base">{log.grams}g</p>
                                                        <button onClick={() => handleEditLog(log)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"><Edit size={16} /></button>
                                                        <button onClick={() => handleDeleteClick(log)} className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-text-muted"><Zap size={48} className="mx-auto mb-4 opacity-50" /><p>No hay registros</p><p className="text-sm">¡Comienza tu seguimiento!</p></div>
                                    )}
                                </GlassCard>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showEditModal && editingLog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-bg-primary rounded-xl border border-glass-border max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-glass-border"><h3 className="text-xl font-bold">Editar Registro</h3><button onClick={handleCloseEditModal} className="p-2 rounded-full hover:bg-white/10"><X size={20} /></button></div>
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium mb-2">Fecha</label><p className="bg-bg-secondary px-3 py-2 rounded-lg border border-glass-border">{formatDateForDisplay(editingLog.log_date)}</p></div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Gramos de creatina</label>
                                <input type="number" step="0.1" min="0.1" max="50" value={editGrams} onChange={(e) => setEditGrams(e.target.value)} className="w-full px-4 py-2 bg-bg-secondary border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" required autoFocus />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" disabled={isSubmitting || !editGrams} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-bg-secondary rounded-lg hover:bg-accent/90 disabled:opacity-50"><Save size={16} />{isSubmitting ? 'Guardando...' : 'Guardar'}</button>
                                <button type="button" onClick={handleCloseEditModal} disabled={isSubmitting} className="px-4 py-2 bg-gray-500/20 rounded-lg hover:bg-gray-500/30">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {logToDelete && (
                <ConfirmationModal
                    message={`¿Eliminar registro de ${logToDelete.grams}g?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setLogToDelete(null)}
                    isLoading={isSubmitting}
                    confirmText="Eliminar"
                />
            )}
        </>
    );
};

export default CreatinaTracker;