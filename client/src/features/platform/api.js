import api from '../../services/api'
export const platformApi = { me: () => api.get('/api/users/me'), security: (payload) => api.patch('/api/users/security', payload) }
