import api from '../../services/api'
export const codingDSAApi = { problems: () => api.get('/api/dsa/problems'), progress: () => api.get('/api/dsa/progress') }
