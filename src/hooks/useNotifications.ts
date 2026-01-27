import { useCallback, useEffect, useState } from 'react'

type NotificationPermission = 'granted' | 'denied' | 'default'

const NOTIFICATIONS_ENABLED_KEY = 'planning-poker-notifications-enabled'

interface UseNotificationsReturn {
  permission: NotificationPermission
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  requestPermission: () => Promise<boolean>
  notify: (title: string, options?: NotificationOptions) => void
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )

  // Default to true (enabled) if not set
  const [enabled, setEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY)
    return stored === null ? true : stored === 'true'
  })

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(value))
  }, [])

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') {
      return false
    }

    if (Notification.permission === 'granted') {
      setPermission('granted')
      return true
    }

    if (Notification.permission === 'denied') {
      setPermission('denied')
      return false
    }

    const newPermission = await Notification.requestPermission()
    setPermission(newPermission)
    return newPermission === 'granted'
  }, [])

  const notify = useCallback((title: string, options?: NotificationOptions) => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return
    if (!enabled) return // Check if notifications are enabled by user preference
    if (document.hasFocus()) return // Don't notify if tab is focused

    new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options,
    })
  }, [enabled])

  return {
    permission,
    enabled,
    setEnabled,
    requestPermission,
    notify,
  }
}
