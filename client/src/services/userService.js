import api from './api'

export const getMe = () => api.get('/api/users/me')
export const updateProfile = (payload) => api.patch('/api/users/profile', payload)
