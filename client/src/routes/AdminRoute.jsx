import React from 'react'
import { Navigate } from 'react-router-dom'

function AdminRoute({ children }) {
  const hasAdminSession = sessionStorage.getItem('hirepilot-admin') === 'true'
  return hasAdminSession ? children : <Navigate to='/admin' replace />
}

export default AdminRoute
