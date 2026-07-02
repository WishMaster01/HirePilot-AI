import api from '../../services/api'

export const getPlacements = () => api.get('/api/placements')
export const createPlacement = (payload) => api.post('/api/placements', payload)
