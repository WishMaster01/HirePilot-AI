import api from './api'

export const createRazorpayOrder = (payload) => api.post('/api/payment/order', payload)
export const verifyRazorpayPayment = (payload) => api.post('/api/payment/verify', payload)
export const getSubscription = () => api.get('/api/subscriptions/me')
export const getCreditUsage = () => api.get('/api/credits/usage')
