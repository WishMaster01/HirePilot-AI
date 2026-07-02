import { useSelector } from 'react-redux'
import { useContext } from 'react'
import { AuthContext } from '../context/authContextValue'

export function useAuth() {
  const { userData } = useSelector((state) => state.user)
  return { user: userData, isAuthenticated: Boolean(userData) }
}

export function useAuthContext() {
  return useContext(AuthContext)
}
