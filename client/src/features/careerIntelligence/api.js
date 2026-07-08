import api from '../../services/api'
export const careerIntelligenceApi = { getProfile: () => api.get('/api/career/profile'), analyze: (payload) => api.post('/api/career/analyze', payload) }
