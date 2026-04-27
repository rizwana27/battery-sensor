# Battery Sensor Analytics Dashboard

A real-time sensor monitoring portal built to demonstrate full-stack frontend capabilities relevant to embedded sensor device management and cloud data visualization.

**Live Demo:** [Deploy to Vercel — link here]

---

## Relevance to EVident Battery

EVident Battery builds embedded sensors and a cloud-hosted web portal for battery data analysis. This project directly mirrors that use case:

| EVident Use Case | This Project |
|---|---|
| Web UI for embedded sensor devices | Real-time telemetry dashboard per device |
| Cloud portal for sensor data analysis | Multi-device fleet overview + alert log |
| Working with firmware teams | Firmware version tracking + offline detection |
| Interactive dashboards | Live-updating Recharts with 2s refresh |
| Threshold-based alerting | Configurable per-metric alert thresholds |

---

## Features

### Live Monitor
- Real-time telemetry for any selected device: voltage (V), temperature (°C), current (A), state-of-charge (%), internal resistance (mΩ)
- Area charts update every 2 seconds with live data streaming
- Visual threshold breach indicators per metric
- Battery health breakdown with animated progress bars
- Pause/resume stream control

### Fleet Overview
- All 6 sensor devices with live status, health %, firmware version, chemistry type
- Filter by status (online / warning / critical / offline)
- Summary count cards
- Click-through to live monitor for any device

### Alerts & Anomaly Log
- Auto-generated alerts when readings breach configured thresholds
- Severity levels: Critical, Warning, Info
- Dismiss individual or all alerts
- Resolved alert history

### Threshold Configuration
- Configurable limits for all 5 metrics via interactive sliders
- Changes apply immediately and affect alert generation on the next tick

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| Charts | Recharts (AreaChart with live data) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Data | Simulated telemetry with realistic drift models |
| Deploy | Vercel |

**My Role:** Solo developer — architecture, data simulation, UI design, all components

---

## Architecture Notes

- `useSensorData` custom hook manages all live state and runs the 2s tick interval
- `simulator.ts` generates realistic battery telemetry using per-device drift vectors and Gaussian jitter — mimics real LFP/NMC/NCA cell behavior
- Threshold checking deduplicates alerts to prevent spam
- History buffer capped at 60 readings (~2 min window) per device for chart performance

---

## Running Locally

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

---

## What I'd Add With More Time

- WebSocket connection to a real FastAPI backend (I have production experience with this stack)
- AWS IoT Core integration for real device telemetry ingestion
- Authentication layer (JWT via FastAPI)
- Historical data export (CSV)
- Per-device threshold overrides
