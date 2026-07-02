import React from 'react'
import { useSelector } from 'react-redux'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  const { userData } = useSelector((state) => state.user)
  return <AuthContext.Provider value={{ user: userData, isAuthenticated: Boolean(userData) }}>{children}</AuthContext.Provider>
}
