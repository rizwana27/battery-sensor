import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { SensorReading } from '../utils/types'
import { formatTimestamp } from '../utils/simulator'

interface MetricChartProps {
  history: SensorReading[]
  metric: keyof Omit<SensorReading, 'timestamp'>
  label: string
  unit: string
  color: string
  min?: number
  max?: number
  warningMin?: number
  warningMax?: number
  decimals?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label, unit, decimals = 2 }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ev-panel border border-ev-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <div className="text-ev-muted mb-1">{label}</div>
      <div className="text-ev-text font-semibold">
        {Number(payload[0].value).toFixed(decimals)} {unit}
      </div>
    </div>
  )
}

export default function MetricChart({
  history, metric, label, unit, color,
  min, max, warningMin, warningMax, decimals = 2
}: MetricChartProps) {
  const latest = history[history.length - 1]
  const value  = latest?.[metric] ?? 0

  const data = history.map(r => ({
    time:  formatTimestamp(r.timestamp),
    value: r[metric],
  }))

  // Dynamic Y domain with some padding
  const values = history.map(r => r[metric] as number)
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const pad = (dataMax - dataMin) * 0.3 || 0.5
  const yMin = min !== undefined ? Math.min(min, dataMin - pad) : dataMin - pad
  const yMax = max !== undefined ? Math.max(max, dataMax + pad) : dataMax + pad

  const isWarning = (
    (warningMin !== undefined && value < warningMin) ||
    (warningMax !== undefined && value > warningMax)
  )

  return (
    <div className="bg-ev-panel border border-ev-border rounded-xl p-4 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-ev-muted uppercase tracking-widest font-mono">{label}</div>
          <div className={`text-2xl font-mono font-semibold mt-0.5 ${isWarning ? 'text-ev-amber' : 'text-ev-text'}`}>
            {(value as number).toFixed(decimals)}
            <span className="text-sm font-normal text-ev-muted ml-1">{unit}</span>
          </div>
        </div>
        {isWarning && (
          <span className="text-[10px] font-mono bg-ev-amber/10 text-ev-amber border border-ev-amber/30 px-2 py-1 rounded-full uppercase tracking-wider">
            ⚠ alert
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={90}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis domain={[yMin, yMax]} hide />
          <Tooltip content={<CustomTooltip unit={unit} decimals={decimals} />} />
          {warningMax !== undefined && (
            <ReferenceLine y={warningMax} stroke="#ffaa0044" strokeDasharray="3 3" />
          )}
          {warningMin !== undefined && (
            <ReferenceLine y={warningMin} stroke="#ffaa0044" strokeDasharray="3 3" />
          )}
          <Area
            type="monotoneX"
            dataKey="value"
            stroke={isWarning ? '#ffaa00' : color}
            strokeWidth={1.5}
            fill={`url(#grad-${metric})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
