import api from '../../services/api'
export const resumeIntelligenceApi = { history: () => api.get('/api/resume/history'), analyze: (payload) => api.post('/api/resume/analyze', payload) }
