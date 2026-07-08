import api from '../../services/api'
export const portfolioBrandingApi = { suggestions: (payload) => api.post('/api/portfolio/suggestions', payload), linkedInHistory: () => api.get('/api/linkedin/history') }
