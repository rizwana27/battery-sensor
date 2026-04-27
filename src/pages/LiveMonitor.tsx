import { useState } from 'react'
import { ChevronDown, Pause, Play, Wifi, WifiOff, Cpu } from 'lucide-react'
import { Device, Thresholds } from '../utils/types'
import { getStatusDot, formatRelativeTime } from '../utils/simulator'
import MetricChart from '../components/MetricChart'

interface LiveMonitorProps {
  devices: Device[]
  thresholds: Thresholds
  isPaused: boolean
  setIsPaused: (v: boolean) => void
}

export default function LiveMonitor({ devices, thresholds, isPaused, setIsPaused }: LiveMonitorProps) {
  const [selectedId, setSelectedId] = useState(devices[0]?.id ?? '')
  const [open, setOpen] = useState(false)

  const device = devices.find(d => d.id === selectedId) ?? devices[0]
  if (!device) return null

  const latest = device.history[device.history.length - 1]

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-5 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ev-text">Live Monitor</h1>
          <p className="text-xs text-ev-muted mt-0.5">Real-time telemetry · 2s refresh</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Pause/resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ev-border hover:border-ev-accent/40 text-ev-muted hover:text-ev-accent transition-all text-xs font-mono"
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          {/* Device selector */}
          <div className="relative">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ev-panel border border-ev-border hover:border-ev-accent/40 transition-all text-sm min-w-[200px]"
            >
              <span className={`w-2 h-2 rounded-full ${getStatusDot(device.status)}`} />
              <span className="flex-1 text-left font-mono text-ev-text">{device.name}</span>
              <ChevronDown size={14} className="text-ev-muted" />
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-ev-panel border border-ev-border rounded-xl shadow-2xl z-10 py-1 animate-slide-up">
                {devices.map(d => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedId(d.id); setOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-left ${d.id === selectedId ? 'text-ev-accent' : 'text-ev-text'}`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusDot(d.status)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono truncate">{d.name}</div>
                      <div className="text-[10px] text-ev-muted truncate">{d.location}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Device info strip */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Status',     value: device.status.toUpperCase(), color: device.status === 'online' ? 'text-ev-green' : device.status === 'warning' ? 'text-ev-amber' : 'text-ev-red' },
          { label: 'Chemistry',  value: device.chemistry,            color: 'text-ev-text' },
          { label: 'Cells',      value: `${device.cellCount} series`, color: 'text-ev-text' },
          { label: 'Health',     value: `${device.batteryHealth}%`,  color: device.batteryHealth > 80 ? 'text-ev-green' : device.batteryHealth > 60 ? 'text-ev-amber' : 'text-ev-red' },
          { label: 'Last Seen',  value: formatRelativeTime(device.lastSeen), color: 'text-ev-text' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-ev-panel border border-ev-border rounded-xl px-4 py-3">
            <div className="text-[10px] text-ev-muted uppercase tracking-widest font-mono mb-1">{label}</div>
            <div className={`text-sm font-mono font-semibold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-xs text-ev-muted font-mono">
        {device.status === 'offline'
          ? <><WifiOff size={11} className="text-ev-muted" /> Offline · last reading {formatRelativeTime(latest?.timestamp ?? 0)}</>
          : isPaused
          ? <><Pause size={11} /> Paused</>
          : <><div className="w-1.5 h-1.5 rounded-full bg-ev-green animate-pulse" /> <Wifi size={11} className="text-ev-green" /> Streaming · {formatRelativeTime(latest?.timestamp ?? 0)}</>
        }
        <span className="ml-2 flex items-center gap-1"><Cpu size={11} /> FW {device.firmware}</span>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricChart
          history={device.history}
          metric="voltage"
          label="Cell Voltage"
          unit="V"
          color="#00d4ff"
          warningMin={thresholds.voltage.min}
          warningMax={thresholds.voltage.max}
          decimals={3}
        />
        <MetricChart
          history={device.history}
          metric="temperature"
          label="Temperature"
          unit="°C"
          color="#ff6b35"
          warningMin={thresholds.temperature.min}
          warningMax={thresholds.temperature.max}
          decimals={1}
        />
        <MetricChart
          history={device.history}
          metric="soc"
          label="State of Charge"
          unit="%"
          color="#00ff88"
          warningMin={thresholds.soc.min}
          decimals={1}
        />
        <MetricChart
          history={device.history}
          metric="current"
          label="Current"
          unit="A"
          color="#a78bfa"
          warningMin={thresholds.current.min}
          warningMax={thresholds.current.max}
          decimals={2}
        />
        <MetricChart
          history={device.history}
          metric="impedance"
          label="Internal Resistance"
          unit="mΩ"
          color="#fbbf24"
          warningMax={thresholds.impedance.max}
          decimals={1}
        />

        {/* SOC Gauge replacement - SoC history as bar */}
        <div className="bg-ev-panel border border-ev-border rounded-xl p-4 flex flex-col gap-3">
          <div className="text-xs text-ev-muted uppercase tracking-widest font-mono">Battery Health</div>
          <div className="flex-1 flex flex-col justify-center gap-2">
            {[
              { label: 'Overall Health', val: device.batteryHealth },
              { label: 'Capacity Ret.',  val: Math.round(device.batteryHealth * 0.97) },
              { label: 'Cycle Eff.',     val: Math.round(85 + device.batteryHealth * 0.1) },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ev-muted font-mono">{label}</span>
                  <span className="text-ev-text font-mono font-semibold">{val}%</span>
                </div>
                <div className="h-1.5 bg-ev-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${val > 80 ? 'bg-ev-green' : val > 60 ? 'bg-ev-amber' : 'bg-ev-red'}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
