import api from '../../services/api'
export const productivityApi = { goals: () => api.get('/api/productivity/daily-goals'), reminders: () => api.get('/api/productivity/reminders') }
