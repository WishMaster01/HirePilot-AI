import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

export const getAdminUsers = () => api.get('/api/admin/users').then(unwrap)
export const getAdminAnalytics = () => api.get('/api/admin/analytics').then(unwrap)
export const getAdminInterviews = () => api.get('/api/admin/interviews').then(unwrap)
export const getAdminReports = () => api.get('/api/admin/reports').then(unwrap)
export const updateAdminUserRole = (id, role) => api.patch(`/api/admin/users/${id}/role`, { role }).then(unwrap)
export const deleteAdminUser = (id) => api.delete(`/api/admin/users/${id}`).then(unwrap)

export const getAdminAiUsage = () => api.get('/api/admin/ai-usage').then(unwrap)
export const getAdminRevenue = () => api.get('/api/admin/revenue').then(unwrap)
export const getAdminSystemHealth = () => api.get('/api/admin/system-health').then(unwrap)
export const getAdminContentModeration = () => api.get('/api/admin/content-moderation').then(unwrap)

export const getAdminDashboardBundle = async () => {
  const [
    users,
    analytics,
    interviews,
    reports,
    aiUsage,
    revenue,
    systemHealth,
    contentModeration,
  ] = await Promise.all([
    getAdminUsers(),
    getAdminAnalytics(),
    getAdminInterviews(),
    getAdminReports(),
    getAdminAiUsage().catch(() => null),
    getAdminRevenue().catch(() => null),
    getAdminSystemHealth().catch(() => null),
    getAdminContentModeration().catch(() => null),
  ])

  return {
    users,
    analytics,
    interviews,
    reports,
    aiUsage,
    revenue,
    systemHealth,
    contentModeration,
  }
}
