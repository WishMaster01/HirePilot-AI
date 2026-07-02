import { useContext } from 'react'
import { NotificationContext } from '../context/notificationContextValue'

export function useNotifications() {
  return useContext(NotificationContext)
}
