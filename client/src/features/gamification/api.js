import api from '../../services/api'
export const gamificationSuiteApi = { stats: () => api.get('/api/gamification/stats'), streaks: () => api.get('/api/gamification/streaks') }
