import api from '../../services/api'

export const getPosts = () => api.get('/api/community/posts')
export const createPost = (payload) => api.post('/api/community/posts', payload)
