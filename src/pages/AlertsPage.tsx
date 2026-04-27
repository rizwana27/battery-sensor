import { BellOff, CheckCheck, AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react'
import { Alert } from '../utils/types'

interface AlertsPageProps {
  alerts: Alert[]
  dismissAlert: (id: string) => void
  dismissAll: () => void
}

const severityConfig = {
  critical: { icon: AlertCircle,   color: 'text-ev-red',   bg: 'bg-ev-red/10',   border: 'border-ev-red/30',   label: 'CRITICAL' },
  warning:  { icon: AlertTriangle, color: 'text-ev-amber', bg: 'bg-ev-amber/10', border: 'border-ev-amber/30', label: 'WARNING'  },
  info:     { icon: Info,          color: 'text-ev-accent',bg: 'bg-ev-accent/10',border: 'border-ev-accent/30',label: 'INFO'     },
}

export default function AlertsPage({ alerts, dismissAlert, dismissAll }: AlertsPageProps) {
  const active    = alerts.filter(a => !a.dismissed)
  const dismissed = alerts.filter(a => a.dismissed)

  const criticalCount = active.filter(a => a.severity === 'critical').length
  const warningCount  = active.filter(a => a.severity === 'warning').length
  const infoCount     = active.filter(a => a.severity === 'info').length

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ev-text">Alerts & Anomaly Log</h1>
          <p className="text-xs text-ev-muted mt-0.5">{active.length} active · {dismissed.length} resolved</p>
        </div>
        {active.length > 0 && (
          <button
            onClick={dismissAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ev-border hover:border-ev-green/40 text-ev-muted hover:text-ev-green transition-all text-xs font-mono"
          >
            <CheckCheck size={12} />
            Dismiss All
          </button>
        )}
      </div>

      {/* Counts */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { title: 'Critical', count: criticalCount, ...severityConfig.critical },
          { title: 'Warning',  count: warningCount,  ...severityConfig.warning  },
          { title: 'Info',     count: infoCount,     ...severityConfig.info     },
        ].map(({ title, count, color, bg, border }) => (
          <div key={title} className={`rounded-xl border px-5 py-4 ${bg} ${border}`}>
            <div className={`text-3xl font-mono font-bold ${color}`}>{count}</div>
            <div className="text-xs text-ev-muted mt-1 font-mono uppercase tracking-widest">{title}</div>
          </div>
        ))}
      </div>

      {/* Active alerts */}
      {active.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-ev-muted py-20">
          <BellOff size={32} strokeWidth={1.5} />
          <div className="text-sm font-mono">No active alerts</div>
          <div className="text-xs">All sensors operating within threshold limits</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-ev-muted font-mono uppercase tracking-widest mb-1">Active</div>
          {active.map(alert => {
            const cfg = severityConfig[alert.severity]
            const Icon = cfg.icon
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-4 p-4 rounded-xl border ${cfg.bg} ${cfg.border} group animate-slide-up`}
              >
                <Icon size={16} className={`${cfg.color} mt-0.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] font-mono text-ev-muted bg-ev-panel border border-ev-border px-1.5 py-0.5 rounded">
                      {alert.deviceName}
                    </span>
                    <span className="text-[10px] font-mono text-ev-muted bg-ev-panel border border-ev-border px-1.5 py-0.5 rounded uppercase">
                      {alert.metric}
                    </span>
                  </div>
                  <p className="text-sm text-ev-text font-mono">{alert.message}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-ev-muted font-mono">
                    <Clock size={9} />
                    {new Date(alert.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                    <span className="mx-1">·</span>
                    {alert.deviceId}
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-ev-muted hover:text-ev-text transition-colors text-[10px] font-mono px-2 py-1 rounded border border-transparent hover:border-ev-border shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Dismissed / history */}
      {dismissed.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-ev-muted font-mono uppercase tracking-widest mt-2 mb-1">Resolved History</div>
          {dismissed.slice(0, 10).map(alert => (
            <div key={alert.id} className="flex items-center gap-4 px-4 py-3 rounded-lg border border-ev-border/50 opacity-40 text-xs font-mono">
              <span className="text-ev-muted uppercase tracking-wider">{alert.severity}</span>
              <span className="text-ev-muted">·</span>
              <span className="text-ev-text">{alert.deviceName}</span>
              <span className="text-ev-muted flex-1 truncate">{alert.message}</span>
              <span className="text-ev-muted text-[10px]">{new Date(alert.timestamp).toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
