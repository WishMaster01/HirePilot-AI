import api from './api'

export const getCareerProfile = () => api.get('/api/career-profile/me')
export const saveCareerProfile = (payload) => api.post('/api/career-profile', payload)
export const analyzeCareerProfile = () => api.post('/api/career-profile/analyze')
