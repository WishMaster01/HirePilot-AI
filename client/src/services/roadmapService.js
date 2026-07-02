import api from './api'

export const generateRoadmap = (payload) => api.post('/api/roadmaps/generate', payload)
export const getRoadmaps = () => api.get('/api/roadmaps')
