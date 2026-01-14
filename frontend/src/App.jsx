import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './components/views/Overview';
import { SimulatorView } from './components/views/SimulatorView';
import { DSSView } from './components/views/DSSView';
import { ESView } from './components/views/ESView';
import { SettingsView } from './components/views/SettingsView';
import { MachineListModal } from './components/MachineListModal';
import api from './api';

const SPECIFIC_ALERTS = []; // Deprecated: Now using real backend alerts

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: { active_machines: 0, active_alerts: 0 },
    trends: { avg_temp: 0, avg_vib: 0 },
    history: [],
    alerts: []
  });
  const [isMachineListOpen, setIsMachineListOpen] = useState(false);

  // Generate 500 machine entries based on API data where possible
  const machineList = useMemo(() => {
    // Get list of IDs that have alerts from the backend
    const alertIds = data.alerts.map(a => a.machine_id);

    return Array.from({ length: 500 }, (_, i) => {
      const id = `M-${(i + 1).toString().padStart(3, '0')}`;
      const isOff = i >= 490; // Fixed: Last 10 machines OFF (490 Active)

      let condition = 'Normal';
      let color = 'text-success bg-success/10';

      // Use backend data for Critical status
      if (alertIds.includes(id)) {
        condition = 'Critical';
        color = 'text-danger bg-danger/10';
      } else {
        // Fallback random "Below Normal" for variety if not critical
        // But strictly stick to 0 Criticals if backend says 0
        const rand = Math.random();
        if (rand > 0.95) {
          condition = 'Below Normal';
          color = 'text-warning bg-warning/10';
        }
      }

      const diagnostics = {
        ruleProcessingCost: `${(Math.random() * 5 + 10).toFixed(1)}ms`,
        kbHitRate: `${(Math.random() * 2 + 97).toFixed(1)}%`,
        reliability: `${(Math.random() * 10 + 85).toFixed(0)}%`,
        projected: `${(Math.random() * 10 + 82).toFixed(1)}%`,
        lastScan: new Date().toLocaleTimeString(),
        details: condition === 'Normal'
          ? 'Routine diagnostic cycle complete. All operating parameters within nominal thresholds.'
          : 'Anomalous pattern detected. Cross-referencing with failure modes DB.'
      };

      return { id, status: isOff ? 'OFF' : 'ON', condition, color, diagnostics };
    });
  }, [data.alerts]); // Re-calculate when alerts change

  const activeMachinesCount = machineList.filter(m => m.status === 'ON').length;

  // Calculate dynamic stats based on machine list
  const stats = useMemo(() => {
    const total = 500;
    const critical = machineList.filter(m => m.condition === 'Critical').length;
    const belowNormal = machineList.filter(m => m.condition === 'Below Normal').length;

    // Production: Base on active machines - small efficiency loss
    const productionVal = (activeMachinesCount / total) * 100 - (Math.random() * 2);

    // Energy: Penalize for critical/below normal machines (tuned for realism)
    const energyVal = 100 - (critical * 0.3) - (belowNormal * 0.1);

    // Dynamic Trends (Simulate comparison to "Yesterday")
    const prevActive = activeMachinesCount - Math.floor(Math.random() * 10 - 5); // +/- 5 diff
    const activeTrend = ((activeMachinesCount - prevActive) / prevActive) * 100;

    const prevProd = productionVal - (Math.random() * 5 - 2.5);
    const prodTrend = ((productionVal - prevProd) / prevProd) * 100;

    const prevEnergy = energyVal + (Math.random() * 3 - 1.5);
    const energyTrend = ((energyVal - prevEnergy) / prevEnergy) * 100;

    return {
      production: { value: productionVal.toFixed(1), trend: prodTrend.toFixed(1) },
      energy: { value: energyVal.toFixed(1), trend: energyTrend.toFixed(1) },
      active: { value: activeMachinesCount, trend: activeTrend.toFixed(1) }
    };
  }, [machineList, activeMachinesCount]);

  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/dashboard/overview'),
        api.get('/dss/trends'),
        api.get('/es/diagnoses'),
        api.get('/machines'),
        api.get('/dss/forecast'),
        api.get('/dashboard/history')
      ]);

      // Helper to safely extract data or return default
      const getVal = (res, def) => (res.status === 'fulfilled' ? res.value.data : def);

      const overviewData = getVal(results[0], { active_machines: activeMachinesCount, active_alerts: 0, total_machines: 500 });
      const trendsData = getVal(results[1], { avg_temp: 0, avg_vib: 0 });
      const alertsData = getVal(results[2], []);
      const machinesData = getVal(results[3], []); // Not used for history but good to have
      const forecastData = getVal(results[4], { current_efficiency: 94.0 });
      const historyData = getVal(results[5], []);

      // Check if critical endpoints failed
      if (results[0].status === 'rejected' || results[5].status === 'rejected') {
        setError("Connection to backend server unstable. Some data may be outdated.");
      } else {
        setError(null);
      }

      // Safe Overview merge
      const safeOverview = {
        ...overviewData,
        active_machines: activeMachinesCount,
        total_machines: overviewData.total_machines || 500
      };

      setData({
        overview: safeOverview,
        trends: trendsData,
        history: historyData,
        alerts: alertsData,
        forecast: forecastData
      });
    } catch (err) {
      console.error("Critical Fetch Error:", err);
      setError("Failed to connect to system API. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [activeMachinesCount]);

  if (loading && !data.history.length) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary animate-pulse">Initializing System...</div>;
  }

  if (loading && !data.history.length) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary animate-pulse">Initializing System...</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview
          data={{ ...data, overview: { ...data.overview, active_machines: activeMachinesCount } }}
          stats={stats}
          machineList={machineList}
          onOpenMachineList={() => setIsMachineListOpen(true)}
        />;
      case 'simulator':
        return <SimulatorView
          data={data}
          onOpenMachineList={() => setIsMachineListOpen(true)}
        />;
      case 'dss': return <DSSView forecast={data.forecast} />;
      case 'es': return <ESView alerts={data.alerts} />;
      case 'settings': return <SettingsView />;
      default: return <Overview data={data} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {error && (
        <div className="bg-danger/10 border-b border-danger/20 text-danger px-6 py-2 text-sm flex items-center justify-center animate-pulse">
          {error}
        </div>
      )}
      {renderContent()}
      <MachineListModal
        isOpen={isMachineListOpen}
        onClose={() => setIsMachineListOpen(false)}
        machineList={machineList}
      />
    </DashboardLayout>
  );
}

export default App;
