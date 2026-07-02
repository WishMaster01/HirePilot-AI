import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
})

api.interceptors.request.use((config) => config)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const safeError = error?.response?.data || { message: error.message || 'Request failed' }
    return Promise.reject(safeError)
  },
)

export default api
