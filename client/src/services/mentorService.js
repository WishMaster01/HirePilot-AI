import api from './api'

export const sendMentorMessage = (payload) => api.post('/api/mentor/chat', payload)
export const getMentorSessions = () => api.get('/api/mentor/sessions')
