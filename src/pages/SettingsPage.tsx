import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { Thresholds } from '../utils/types'
import { DEFAULT_THRESHOLDS } from '../utils/simulator'

interface SettingsPageProps {
  thresholds: Thresholds
  setThresholds: (t: Thresholds) => void
}

interface ThresholdRow {
  key: keyof Thresholds
  label: string
  unit: string
  fields: { field: string; label: string; min?: number; max?: number; step: number }[]
}

const rows: ThresholdRow[] = [
  {
    key: 'voltage',
    label: 'Cell Voltage',
    unit: 'V',
    fields: [
      { field: 'min', label: 'Min', min: 2.5, max: 3.5, step: 0.05 },
      { field: 'max', label: 'Max', min: 3.8, max: 4.5, step: 0.05 },
    ],
  },
  {
    key: 'temperature',
    label: 'Temperature',
    unit: '°C',
    fields: [
      { field: 'min', label: 'Min', min: -20, max: 20, step: 1 },
      { field: 'max', label: 'Max', min: 30,  max: 80, step: 1 },
    ],
  },
  {
    key: 'current',
    label: 'Current',
    unit: 'A',
    fields: [
      { field: 'min', label: 'Min (discharge)', min: -100, max: 0, step: 1 },
      { field: 'max', label: 'Max (charge)',    min: 0, max: 100, step: 1  },
    ],
  },
  {
    key: 'soc',
    label: 'State of Charge',
    unit: '%',
    fields: [
      { field: 'min', label: 'Low SoC Alert', min: 0, max: 30, step: 1 },
    ],
  },
  {
    key: 'impedance',
    label: 'Internal Resistance',
    unit: 'mΩ',
    fields: [
      { field: 'max', label: 'Max Impedance', min: 40, max: 200, step: 5 },
    ],
  },
]

export default function SettingsPage({ thresholds, setThresholds }: SettingsPageProps) {
  const [local, setLocal] = useState<Thresholds>(thresholds)
  const [saved, setSaved]  = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (key: keyof Thresholds, field: string, value: number) => {
    setLocal(prev => ({
      ...prev,
      [key]: { ...(prev[key] as object), [field]: value },
    }))
    setSaved(false)
  }

  const save = () => {
    setThresholds(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const reset = () => {
    setLocal(DEFAULT_THRESHOLDS)
    setSaved(false)
  }

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ev-text">Alert Thresholds</h1>
          <p className="text-xs text-ev-muted mt-0.5">Configure limits that trigger alerts across all devices</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ev-border hover:border-ev-muted text-ev-muted transition-all text-xs font-mono"
          >
            <RotateCcw size={11} />
            Reset defaults
          </button>
          <button
            onClick={save}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
              saved
                ? 'bg-ev-green/20 border border-ev-green/40 text-ev-green'
                : 'bg-ev-accent/10 border border-ev-accent/30 text-ev-accent hover:bg-ev-accent/20'
            }`}
          >
            <Save size={11} />
            {saved ? 'Saved!' : 'Apply Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-2xl">
        {rows.map(({ key, label, unit, fields }) => (
          <div key={key} className="bg-ev-panel border border-ev-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-sm font-semibold text-ev-text">{label}</div>
              <span className="text-[10px] font-mono text-ev-muted bg-ev-border/50 px-2 py-0.5 rounded">{unit}</span>
            </div>
            <div className="flex flex-col gap-4">
              {fields.map(({ field, label: fieldLabel, min: fMin, max: fMax, step }) => {
                const threshObj = local[key] as Record<string, number>
                const val = threshObj[field] ?? 0
                return (
                  <div key={field}>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-mono text-ev-muted">{fieldLabel}</label>
                      <span className="text-xs font-mono text-ev-accent font-semibold">
                        {val} {unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={fMin}
                      max={fMax}
                      step={step}
                      value={val}
                      onChange={e => update(key, field, parseFloat(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #00d4ff ${((val - (fMin ?? 0)) / ((fMax ?? 100) - (fMin ?? 0))) * 100}%, #1e2d4a ${((val - (fMin ?? 0)) / ((fMax ?? 100) - (fMin ?? 0))) * 100}%)`,
                      }}
                    />
                    <div className="flex justify-between text-[9px] font-mono text-ev-muted mt-1">
                      <span>{fMin} {unit}</span>
                      <span>{fMax} {unit}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-ev-panel border border-ev-border/50 rounded-xl p-4 max-w-2xl">
        <div className="text-xs text-ev-muted font-mono">
          <div className="text-ev-accent/70 mb-2">ℹ Threshold Behavior</div>
          Changes take effect immediately after clicking Apply. Active alerts will re-evaluate against new thresholds on the next sensor tick (2s). Dismissed alerts are not re-raised unless the condition recurs.
        </div>
      </div>
    </div>
  )
}
