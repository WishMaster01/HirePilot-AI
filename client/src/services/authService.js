import api from './api'

export const getCurrentUser = () => api.get('/api/user/current-user')
export const logout = () => api.get('/api/auth/logout')
export const googleLogin = (payload) => api.post('/api/auth/google', payload)
