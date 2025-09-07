// Formatear fecha para mostrar
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

// Formatear fecha para mostrar al usuario
export const formatDateForDisplay = (date) => {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Obtener fecha de hoy en formato YYYY-MM-DD
export const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

// Verificar si una fecha es hoy
export const isToday = (date) => {
    return formatDate(date) === getTodayDate();
};

// Obtener fecha de hace X días
export const getDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return formatDate(date);
};

// Parsear fecha desde string
export const parseDate = (dateString) => {
  return new Date(dateString + 'T00:00:00');
};

// Obtener fecha de hoy en formato YYYY-MM-DD
export const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// Calcular días entre fechas
export const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

// --- INICIO DE LA MODIFICACIÓN ---
// Formatear fecha a formato corto DD/MM/YYYY
export const formatDateToShort = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString + 'T00:00:00');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};
// --- FIN DE LA MODIFICACIÓN ---