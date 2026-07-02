import React, { useState } from 'react'
import { NotificationContext } from './notificationContextValue'

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const pushNotification = (notification) => setNotifications((prev) => [notification, ...prev])
  return <NotificationContext.Provider value={{ notifications, pushNotification }}>{children}</NotificationContext.Provider>
}
