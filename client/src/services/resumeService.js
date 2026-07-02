import api from './api'

export const createResume = (payload) => api.post('/api/resumes', payload)
export const getResumes = () => api.get('/api/resumes')
export const analyzeResume = (id, payload) => api.post(`/api/resumes/${id}/analyze`, payload)
export const atsCheckResume = (id, payload) => api.post(`/api/resumes/${id}/ats-check`, payload)
export const rewriteResume = (id, payload) => api.post(`/api/resumes/${id}/rewrite`, payload)
