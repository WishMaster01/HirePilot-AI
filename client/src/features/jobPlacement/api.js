import api from '../../services/api'
export const jobPlacementApi = { recommended: () => api.get('/api/jobs/recommended'), placements: () => api.get('/api/placements') }
