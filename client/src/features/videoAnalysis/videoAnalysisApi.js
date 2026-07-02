import api from '../../services/api'

export const createVideoAnalysis = (payload) => api.post('/api/video-analysis', payload)
