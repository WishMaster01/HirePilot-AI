import api from '../../services/api'

export const analyzeLinkedIn = (payload) => api.post('/api/linkedin/analyze', payload)
