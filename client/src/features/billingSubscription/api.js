import api from '../../services/api'
export const billingSubscriptionApi = { plans: () => api.get('/api/billing/plans'), credits: () => api.get('/api/billing/credits') }
