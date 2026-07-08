import api from '../../services/api'
export const administrationApi = { users: () => api.get('/api/admin/users'), health: () => api.get('/api/admin/system-health') }
