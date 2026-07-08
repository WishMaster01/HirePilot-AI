import api from '../../services/api'
export const aiMentorApi = { chat: (payload) => api.post('/api/mentor/chat', payload), daily: () => api.get('/api/mentor/daily-recommendations') }
