import { useState, useEffect, useCallback, useRef } from 'react'
import { Device, Alert, Thresholds } from '../utils/types'
import {
  createInitialDevices,
  tickReading,
  checkThresholds,
  DEFAULT_THRESHOLDS,
} from '../utils/simulator'

const HISTORY_MAX = 60

export function useSensorData() {
  const [devices, setDevices]     = useState<Device[]>(() => createInitialDevices())
  const [alerts, setAlerts]       = useState<Alert[]>([])
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS)
  const [isPaused, setIsPaused]   = useState(false)
  const alertsRef = useRef(alerts)
  alertsRef.current = alerts

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setDevices(prev => {
        const updated = prev.map((device, i) => {
          if (device.status === 'offline') return device
          const latest = device.history[device.history.length - 1]
          const next = tickReading(latest, i)
          const history = [...device.history, next].slice(-HISTORY_MAX)
          return { ...device, history, lastSeen: Date.now() }
        })

        // Check for new alerts
        const newAlerts = checkThresholds(updated, thresholds, alertsRef.current)
        if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev].slice(0, 100))
        }

        return updated
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isPaused, thresholds])

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a))
  }, [])

  const dismissAll = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, dismissed: true })))
  }, [])

  const activeAlerts = alerts.filter(a => !a.dismissed)
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length

  return {
    devices,
    alerts,
    activeAlerts,
    criticalCount,
    thresholds,
    setThresholds,
    isPaused,
    setIsPaused,
    dismissAlert,
    dismissAll,
  }
}
