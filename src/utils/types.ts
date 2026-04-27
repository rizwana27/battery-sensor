export type DeviceStatus = 'online' | 'warning' | 'critical' | 'offline'

export interface SensorReading {
  timestamp: number
  voltage: number       // V  (nominal ~3.7)
  temperature: number   // °C (safe range 15-45)
  current: number       // A  (charge/discharge)
  soc: number           // % State of Charge
  impedance: number     // mΩ internal resistance
}

export interface Device {
  id: string
  name: string
  location: string
  status: DeviceStatus
  firmware: string
  lastSeen: number
  batteryHealth: number  // %
  cellCount: number
  chemistry: 'LFP' | 'NMC' | 'NCA'
  history: SensorReading[]
}

export interface Alert {
  id: string
  deviceId: string
  deviceName: string
  metric: keyof Omit<SensorReading, 'timestamp'>
  value: number
  threshold: number
  severity: 'critical' | 'warning' | 'info'
  timestamp: number
  dismissed: boolean
  message: string
}

export interface Thresholds {
  voltage: { min: number; max: number }
  temperature: { min: number; max: number }
  current: { min: number; max: number }
  soc: { min: number; max: number }
  impedance: { max: number }
}
