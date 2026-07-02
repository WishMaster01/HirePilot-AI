import api from './api'

export const analyzeProject = (payload) => api.post('/api/projects/analyze', payload)
export const getProjectAnalyses = () => api.get('/api/projects/analyses')
