import api from '../../services/api'

export const getNotifications = () => api.get('/api/notifications')
