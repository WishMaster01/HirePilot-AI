import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function PrivateRoute({ children }) {
  const { userData } = useSelector((state) => state.user)
  return userData ? children : <Navigate to='/auth' replace />
}

export default PrivateRoute
