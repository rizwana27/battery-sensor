import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import LiveMonitor from './pages/LiveMonitor'
import FleetOverview from './pages/FleetOverview'
import AlertsPage from './pages/AlertsPage'
import SettingsPage from './pages/SettingsPage'
import { useSensorData } from './hooks/useSensorData'

export default function App() {
  const {
    devices,
    activeAlerts,
    alerts,
    criticalCount,
    thresholds,
    setThresholds,
    isPaused,
    setIsPaused,
    dismissAlert,
    dismissAll,
  } = useSensorData()

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-ev-bg">
        <Sidebar criticalCount={criticalCount} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Routes>
            <Route
              path="/"
              element={
                <LiveMonitor
                  devices={devices}
                  thresholds={thresholds}
                  isPaused={isPaused}
                  setIsPaused={setIsPaused}
                />
              }
            />
            <Route
              path="/fleet"
              element={<FleetOverview devices={devices} />}
            />
            <Route
              path="/alerts"
              element={
                <AlertsPage
                  alerts={alerts}
                  dismissAlert={dismissAlert}
                  dismissAll={dismissAll}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  thresholds={thresholds}
                  setThresholds={setThresholds}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
