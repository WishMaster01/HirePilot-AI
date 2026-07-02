import api from './api'

export const analyzeJobMatches = (payload) => api.post('/api/job-matches/analyze', payload)
export const getJobMatches = () => api.get('/api/job-matches')
