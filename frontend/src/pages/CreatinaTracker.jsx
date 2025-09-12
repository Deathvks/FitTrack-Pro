import React, { useState, useEffect } from 'react';
import { Plus, Calendar, TrendingUp, BarChart3, Edit2, Trash2 } from 'lucide-react';
import { getCreatinaLogs, createCreatinaLog, updateCreatinaLog, deleteCreatinaLog, getCreatinaStats } from '../services/creatinaService';
import { formatDate, parseDate } from '../utils/dateUtils';

const CreatinaTracker = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [logToDelete, setLogToDelete] = useState(null);
  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    grams: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, statsData] = await Promise.all([
        getCreatinaLogs({ limit: 30 }),
        getCreatinaStats(30)
      ]);
      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      setError('Error cargando datos de creatina');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const gramsValue = parseFloat(formData.grams);
    if (isNaN(gramsValue) || gramsValue <= 0) {
      setError('Por favor, introduce una cantidad válida y positiva de gramos.');
      return;
    }

    try {
      if (editingLog) {
        await updateCreatinaLog(editingLog.id, {
          grams: gramsValue,
          notes: formData.notes
        });
        setSuccess('Registro actualizado exitosamente');
      } else {
        await createCreatinaLog({
          log_date: formData.log_date,
          grams: gramsValue,
          notes: formData.notes
        });
        setSuccess('Registro creado exitosamente');
      }
      
      resetForm();
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al guardar el registro');
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setFormData({
      log_date: log.log_date,
      grams: log.grams.toString(),
      notes: log.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = (log) => {
    setLogToDelete(log);
  };

  const confirmDelete = async () => {
    if (!logToDelete) return;

    try {
      await deleteCreatinaLog(logToDelete.id);
      setSuccess('Registro eliminado exitosamente');
      loadData();
    } catch (error) {
      setError('Error al eliminar el registro');
    } finally {
      setLogToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      log_date: new Date().toISOString().split('T')[0],
      grams: '',
      notes: ''
    });
    setEditingLog(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Seguimiento de Creatina
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Registra tu consumo diario de creatina
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nuevo Registro
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Consumido
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalGrams}g
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Promedio Diario
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageGrams}g
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Días Registrados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.daysWithCreatina}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Consistencia
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.consistencyPercentage}%
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {Math.round(stats.consistencyPercentage)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingLog ? 'Editar Registro' : 'Nuevo Registro de Creatina'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {!editingLog && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.log_date}
                    onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gramos
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.grams}
                  onChange={(e) => setFormData({ ...formData, grams: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="5.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Con el desayuno, post-entreno..."
                  rows="3"
                  maxLength="500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  {editingLog ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {logToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-bg-secondary p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-text-primary">
              Confirmar Eliminación
            </h2>
            <p className="text-text-secondary mb-6">
              ¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setLogToDelete(null)}
                className="px-4 py-2 rounded-lg border border-glass-border text-text-primary hover:bg-bg-primary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red hover:opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Registros */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Registros Recientes
        </h2>
        
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No hay registros de creatina aún.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear tu primer registro
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(log.log_date)}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {log.grams}g
                    </div>
                  </div>
                  {log.notes && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {log.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(log)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(log)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatinaTracker;