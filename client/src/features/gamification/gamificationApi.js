import api from '../../services/api'

export const getGamificationStats = () => api.get('/api/gamification/stats')
