import api from '../../services/api'
export const communitySuiteApi = { posts: () => api.get('/api/community/posts'), leaderboard: () => api.get('/api/community/leaderboard') }
