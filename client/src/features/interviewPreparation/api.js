import api from '../../services/api'
export const interviewPreparationApi = { list: () => api.get('/api/interviews'), create: (payload) => api.post('/api/interviews/create', payload) }
