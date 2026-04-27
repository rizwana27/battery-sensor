import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, ArrowRight, Activity } from 'lucide-react'
import { Device, DeviceStatus } from '../utils/types'
import { getStatusDot, getStatusColor, formatRelativeTime } from '../utils/simulator'

interface FleetOverviewProps {
  devices: Device[]
}

type FilterStatus = 'all' | DeviceStatus

export default function FleetOverview({ devices }: FleetOverviewProps) {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const navigate = useNavigate()

  const filtered = filter === 'all' ? devices : devices.filter(d => d.status === filter)

  const counts = {
    all:      devices.length,
    online:   devices.filter(d => d.status === 'online').length,
    warning:  devices.filter(d => d.status === 'warning').length,
    critical: devices.filter(d => d.status === 'critical').length,
    offline:  devices.filter(d => d.status === 'offline').length,
  }

  const filterBtns: { key: FilterStatus; label: string; color: string }[] = [
    { key: 'all',      label: `All (${counts.all})`,           color: 'text-ev-text' },
    { key: 'online',   label: `Online (${counts.online})`,     color: 'text-ev-green' },
    { key: 'warning',  label: `Warning (${counts.warning})`,   color: 'text-ev-amber' },
    { key: 'critical', label: `Critical (${counts.critical})`, color: 'text-ev-red' },
    { key: 'offline',  label: `Offline (${counts.offline})`,   color: 'text-ev-muted' },
  ]

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ev-text">Fleet Overview</h1>
          <p className="text-xs text-ev-muted mt-0.5">{devices.length} sensors registered</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Online',   val: counts.online,   color: 'border-ev-green/30 bg-ev-green/5',   text: 'text-ev-green' },
          { label: 'Warning',  val: counts.warning,  color: 'border-ev-amber/30 bg-ev-amber/5',   text: 'text-ev-amber' },
          { label: 'Critical', val: counts.critical, color: 'border-ev-red/30 bg-ev-red/5',       text: 'text-ev-red' },
          { label: 'Offline',  val: counts.offline,  color: 'border-ev-border bg-ev-panel',       text: 'text-ev-muted' },
        ].map(({ label, val, color, text }) => (
          <div key={label} className={`rounded-xl border px-5 py-4 ${color}`}>
            <div className={`text-3xl font-mono font-bold ${text}`}>{val}</div>
            <div className="text-xs text-ev-muted mt-1 font-mono uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-ev-border pb-1">
        <Filter size={12} className="text-ev-muted mr-2" />
        {filterBtns.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              filter === key
                ? `bg-ev-panel border border-ev-border ${color}`
                : 'text-ev-muted hover:text-ev-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-ev-panel border border-ev-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ev-border">
              {['Device', 'Location', 'Status', 'Health', 'Firmware', 'Chemistry', 'Cells', 'Last Seen', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-ev-muted font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(device => {
              const latest = device.history[device.history.length - 1]
              return (
                <tr
                  key={device.id}
                  className="border-b border-ev-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  onClick={() => navigate('/', { state: { deviceId: device.id } })}
                >
                  <td className="px-4 py-3.5">
                    <div className="font-mono text-ev-text font-medium">{device.name}</div>
                    <div className="text-[10px] text-ev-muted font-mono">{device.id}</div>
                  </td>
                  <td className="px-4 py-3.5 text-ev-muted text-xs font-mono">{device.location}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusDot(device.status)} ${device.status !== 'offline' ? 'animate-pulse-slow' : ''}`} />
                      <span className={`text-xs font-mono font-semibold uppercase tracking-wider ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-ev-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${device.batteryHealth > 80 ? 'bg-ev-green' : device.batteryHealth > 60 ? 'bg-ev-amber' : 'bg-ev-red'}`}
                          style={{ width: `${device.batteryHealth}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-ev-text">{device.batteryHealth}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-ev-muted">{device.firmware}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-ev-accent/10 text-ev-accent border border-ev-accent/20">
                      {device.chemistry}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-ev-text">{device.cellCount}S</td>
                  <td className="px-4 py-3.5 text-xs font-mono text-ev-muted">{formatRelativeTime(device.lastSeen)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-ev-muted group-hover:text-ev-accent transition-colors">
                      {device.status !== 'offline' && <Activity size={12} />}
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Live reading summary */}
      <div className="grid grid-cols-3 gap-3">
        {devices.filter(d => d.status !== 'offline').slice(0, 3).map(device => {
          const latest = device.history[device.history.length - 1]
          return (
            <div key={device.id} className="bg-ev-panel border border-ev-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${getStatusDot(device.status)}`} />
                <span className="text-xs font-mono text-ev-text font-semibold">{device.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { l: 'Voltage',  v: `${latest?.voltage.toFixed(3)}V` },
                  { l: 'Temp',     v: `${latest?.temperature.toFixed(1)}°C` },
                  { l: 'Current',  v: `${latest?.current.toFixed(1)}A` },
                  { l: 'SoC',      v: `${latest?.soc.toFixed(1)}%` },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <div className="text-[9px] text-ev-muted font-mono uppercase">{l}</div>
                    <div className="text-xs font-mono text-ev-text">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
