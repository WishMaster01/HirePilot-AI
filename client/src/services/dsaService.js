import api from './api'

export const getProblems = () => api.get('/api/dsa/problems')
export const createAssessment = (payload) => api.post('/api/dsa/assessment', payload)
export const submitCode = (payload) => api.post('/api/dsa/submissions', payload)
