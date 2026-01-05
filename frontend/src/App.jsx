import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './components/views/Overview';
import { SimulatorView } from './components/views/SimulatorView';
import { DSSView } from './components/views/DSSView';
import { ESView } from './components/views/ESView';
import { SettingsView } from './components/views/SettingsView';
import { MachineListModal } from './components/MachineListModal';
import api from './api';

const SPECIFIC_ALERTS = ['M-080', 'M-103', 'M-105', 'M-151', 'M-162', 'M-182', 'M-212', 'M-221', 'M-229', 'M-241', 'M-261', 'M-265', 'M-274', 'M-279', 'M-313', 'M-321', 'M-434', 'M-461', 'M-464', 'M-482', 'M-491'];

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

  // Generate 500 machine entries ONE time at App level
  const machineList = useMemo(() => {
    return Array.from({ length: 500 }, (_, i) => {
      const id = `M-${(i + 1).toString().padStart(3, '0')}`;
      const isOff = Math.random() < 0.02; // Reduced to 2% chance of being OFF to match ~500 count

      let condition = 'Normal';
      let color = 'text-success bg-success/10';

      if (SPECIFIC_ALERTS.includes(id)) {
        condition = 'Critical';
        color = 'text-danger bg-danger/10';
      } else {
        const rand = Math.random();
        if (rand > 0.98) {
          condition = 'Critical';
          color = 'text-danger bg-danger/10';
        } else if (rand > 0.9) {
          condition = 'Below Normal';
          color = 'text-warning bg-warning/10';
        }
      }

      // Diagnostics Data (For Expert System View)
      const diagnostics = {
        ruleProcessingCost: `${(Math.random() * 5 + 10).toFixed(1)}ms`, // ~10-15ms
        kbHitRate: `${(Math.random() * 2 + 97).toFixed(1)}%`, // ~97-99%
        reliability: `${(Math.random() * 10 + 85).toFixed(0)}%`, // ~85-95%
        projected: `${(Math.random() * 10 + 82).toFixed(1)}%`, // ~82-92%
        lastScan: new Date().toLocaleTimeString(),
        details: condition === 'Normal'
          ? 'Routine diagnostic cycle complete. All operating parameters within nominal thresholds.'
          : 'Anomalous pattern detected. Cross-referencing with failure modes DB.'
      };

      return { id, status: isOff ? 'OFF' : 'ON', condition, color, diagnostics };
    });
  }, []);

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

  const fetchData = async () => {
    try {
      const [overviewRes, trendsRes, alertsRes, machinesRes] = await Promise.all([
        api.get('/dashboard/overview'),
        api.get('/dss/trends'),
        api.get('/es/diagnoses'),
        api.get('/machines')
      ]);

      const mockHistory = machinesRes.data.map((m, i) => ({
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        temperature: m.temperature,
        vibration: m.vibration,
        power: m.power,
        signals: Math.floor(Math.random() * (1500 - 500) + 500) // Random signals between 500-1500
      })).reverse();

      setData({
        overview: { ...overviewRes.data, active_machines: activeMachinesCount }, // Override with frontend sync
        trends: trendsRes.data,
        history: mockHistory,
        alerts: alertsRes.data
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
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
      case 'dss': return <DSSView />;
      case 'es': return <ESView alerts={data.alerts} />;
      case 'settings': return <SettingsView />;
      default: return <Overview data={data} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
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
