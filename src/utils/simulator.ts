import { Device, SensorReading, Alert, Thresholds } from './types'

export const DEFAULT_THRESHOLDS: Thresholds = {
  voltage:     { min: 3.0,  max: 4.2  },
  temperature: { min: 5,    max: 45   },
  current:     { min: -50,  max: 50   },
  soc:         { min: 10,   max: 100  },
  impedance:   { max: 80   },
}

const DEVICE_CONFIGS = [
  { id: 'dev-001', name: 'Cell Pack Alpha',   location: 'Bay A — Rack 1', chemistry: 'NMC' as const, cellCount: 14 },
  { id: 'dev-002', name: 'Cell Pack Beta',    location: 'Bay A — Rack 2', chemistry: 'LFP' as const, cellCount: 16 },
  { id: 'dev-003', name: 'Cell Pack Gamma',   location: 'Bay B — Rack 1', chemistry: 'NCA' as const, cellCount: 12 },
  { id: 'dev-004', name: 'Field Unit #7',     location: 'EV Fleet — Unit 7', chemistry: 'NMC' as const, cellCount: 96 },
  { id: 'dev-005', name: 'Test Bench C2',     location: 'Lab — Station 3', chemistry: 'LFP' as const, cellCount: 8  },
  { id: 'dev-006', name: 'Prototype X1',      location: 'R&D — Bench 2',  chemistry: 'NCA' as const, cellCount: 20 },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function jitter(base: number, range: number) {
  return base + (Math.random() - 0.5) * range * 2
}

function generateHistory(deviceIndex: number, points = 60): SensorReading[] {
  const baseVoltage    = [3.85, 3.65, 4.0, 3.72, 3.55, 3.9][deviceIndex]
  const baseTemp       = [28, 32, 25, 38, 22, 41][deviceIndex]
  const baseCurrent    = [12, -8, 5, 22, 3, -15][deviceIndex]
  const baseSoc        = [78, 45, 92, 61, 33, 88][deviceIndex]
  const baseImpedance  = [35, 42, 28, 55, 38, 62][deviceIndex]

  const readings: SensorReading[] = []
  const now = Date.now()

  for (let i = points; i >= 0; i--) {
    const t = i / points
    readings.push({
      timestamp:   now - i * 2000,
      voltage:     jitter(lerp(baseVoltage - 0.1, baseVoltage, t), 0.03),
      temperature: jitter(lerp(baseTemp - 2, baseTemp, t), 0.8),
      current:     jitter(lerp(baseCurrent * 0.8, baseCurrent, t), 1.5),
      soc:         Math.max(5, jitter(lerp(baseSoc - 3, baseSoc, t), 0.5)),
      impedance:   jitter(lerp(baseImpedance + 2, baseImpedance, t), 1),
    })
  }
  return readings
}

export function createInitialDevices(): Device[] {
  const statuses = ['online', 'warning', 'online', 'online', 'critical', 'online'] as const
  const healths  = [94, 81, 97, 73, 58, 89]
  const firmwares = ['v2.4.1', 'v2.3.8', 'v2.4.1', 'v2.2.0', 'v2.1.3', 'v2.4.0']

  return DEVICE_CONFIGS.map((cfg, i) => ({
    ...cfg,
    status:        statuses[i],
    firmware:      firmwares[i],
    lastSeen:      Date.now() - [0, 0, 0, 0, 180000, 0][i],
    batteryHealth: healths[i],
    history:       generateHistory(i),
  }))
}

export function tickReading(prev: SensorReading, deviceIndex: number): SensorReading {
  const drifts = [
    { v: 0.002, t: 0.15, c: 0.4, s: -0.02, imp: 0.05 },
    { v: -0.001, t: 0.2, c: -0.3, s: -0.03, imp: 0.08 },
    { v: 0.001, t: -0.1, c: 0.2, s: 0.01, imp: -0.02 },
    { v: 0.003, t: 0.3, c: 0.6, s: -0.04, imp: 0.12 },
    { v: -0.003, t: -0.2, c: -0.5, s: 0.02, imp: -0.05 },
    { v: 0.002, t: 0.25, c: -0.2, s: -0.01, imp: 0.03 },
  ]
  const d = drifts[deviceIndex]
  return {
    timestamp:   Date.now(),
    voltage:     Math.max(2.8, Math.min(4.25, jitter(prev.voltage + d.v, 0.02))),
    temperature: Math.max(10, Math.min(55, jitter(prev.temperature + d.t, 0.5))),
    current:     Math.max(-60, Math.min(60, jitter(prev.current + d.c, 1.0))),
    soc:         Math.max(5, Math.min(100, jitter(prev.soc + d.s, 0.3))),
    impedance:   Math.max(20, Math.min(120, jitter(prev.impedance + d.imp, 0.5))),
  }
}

let alertCounter = 0
export function checkThresholds(
  devices: Device[],
  thresholds: Thresholds,
  existing: Alert[]
): Alert[] {
  const newAlerts: Alert[] = []

  devices.forEach(device => {
    if (device.history.length === 0) return
    const latest = device.history[device.history.length - 1]

    const checks: Array<{
      metric: keyof Omit<SensorReading, 'timestamp'>
      value: number
      check: () => boolean
      severity: Alert['severity']
      message: string
    }> = [
      {
        metric: 'temperature',
        value: latest.temperature,
        check: () => latest.temperature > thresholds.temperature.max,
        severity: latest.temperature > 50 ? 'critical' : 'warning',
        message: `Temperature ${latest.temperature.toFixed(1)}°C exceeds ${thresholds.temperature.max}°C limit`,
      },
      {
        metric: 'voltage',
        value: latest.voltage,
        check: () => latest.voltage < thresholds.voltage.min || latest.voltage > thresholds.voltage.max,
        severity: latest.voltage < 2.9 || latest.voltage > 4.25 ? 'critical' : 'warning',
        message: `Voltage ${latest.voltage.toFixed(3)}V out of range [${thresholds.voltage.min}–${thresholds.voltage.max}V]`,
      },
      {
        metric: 'soc',
        value: latest.soc,
        check: () => latest.soc < thresholds.soc.min,
        severity: latest.soc < 5 ? 'critical' : 'info',
        message: `State of Charge low: ${latest.soc.toFixed(1)}%`,
      },
      {
        metric: 'impedance',
        value: latest.impedance,
        check: () => latest.impedance > thresholds.impedance.max,
        severity: latest.impedance > 100 ? 'critical' : 'warning',
        message: `Internal resistance ${latest.impedance.toFixed(1)}mΩ above ${thresholds.impedance.max}mΩ`,
      },
    ]

    checks.forEach(({ metric, value, check, severity, message }) => {
      if (!check()) return
      // Deduplicate: skip if same device+metric alert already exists undismissed
      const dup = existing.find(a => a.deviceId === device.id && a.metric === metric && !a.dismissed)
      if (dup) return
      newAlerts.push({
        id:         `alert-${++alertCounter}`,
        deviceId:   device.id,
        deviceName: device.name,
        metric,
        value,
        threshold:  0,
        severity,
        timestamp:  Date.now(),
        dismissed:  false,
        message,
      })
    })
  })

  return newAlerts
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'online':   return 'text-ev-green'
    case 'warning':  return 'text-ev-amber'
    case 'critical': return 'text-ev-red'
    case 'offline':  return 'text-ev-muted'
    default:         return 'text-ev-muted'
  }
}

export function getStatusDot(status: string): string {
  switch (status) {
    case 'online':   return 'bg-ev-green'
    case 'warning':  return 'bg-ev-amber'
    case 'critical': return 'bg-ev-red'
    case 'offline':  return 'bg-ev-muted'
    default:         return 'bg-ev-muted'
  }
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false })
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 5000)  return 'just now'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}
