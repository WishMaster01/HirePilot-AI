import api from './api'

export const createInterview = (payload) => api.post('/api/interviews', payload)
export const getInterviews = () => api.get('/api/interviews')
export const getInterview = (id) => api.get(`/api/interviews/${id}`)
export const createContextualVideoInterview = (payload) => api.post('/api/contextual-interview/video-assistant', payload)
export const createProfileTrainingQuestions = (payload) => api.post('/api/contextual-interview/training-questions', payload)
