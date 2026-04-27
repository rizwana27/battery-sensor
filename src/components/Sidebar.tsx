import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Server, BellRing, Settings, Zap, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface SidebarProps {
  criticalCount: number
}

export default function Sidebar({ criticalCount }: SidebarProps) {
  const { theme, toggleTheme } = useTheme()
  const links = [
    { to: '/',        icon: LayoutDashboard, label: 'Live Monitor' },
    { to: '/fleet',   icon: Server,          label: 'Fleet Overview' },
    { to: '/alerts',  icon: BellRing,        label: 'Alerts', badge: criticalCount },
    { to: '/settings',icon: Settings,        label: 'Thresholds' },
  ]

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-ev-border bg-ev-panel">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-ev-border">
        <div className="w-7 h-7 rounded bg-ev-accent/20 flex items-center justify-center">
          <Zap size={14} className="text-ev-accent" />
        </div>
        <div>
          <div className="font-mono text-sm font-semibold text-ev-accent tracking-wider">EVident</div>
          <div className="text-[10px] text-ev-muted tracking-widest uppercase">Sensor Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {links.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-ev-accent/10 text-ev-accent border border-ev-accent/20'
                  : 'text-ev-muted hover:text-ev-text hover:bg-white/5'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Icon size={15} />
              <span className="font-medium">{label}</span>
            </div>
            {badge != null && badge > 0 && (
              <span className="text-[10px] font-mono bg-ev-red/20 text-ev-red border border-ev-red/30 px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-ev-border flex items-center justify-between">
        <div className="text-[10px] text-ev-muted font-mono">
          <div className="text-ev-accent/60">● LIVE</div>
          <div className="mt-0.5">2s refresh interval</div>
        </div>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-ev-border hover:border-ev-accent/40 text-ev-muted hover:text-ev-accent transition-all"
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>
    </aside>
  )
}
