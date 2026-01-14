import React, { useState, useEffect } from 'react';
import { TrendChart } from '../TrendChart';
import { Power, Activity, Clock, BarChart2 } from 'lucide-react';
import api from '../../api';

export const SimulatorView = ({ data, onOpenMachineList }) => {
    // Persist state in localStorage, default to true
    const [isSimulatorOn, setIsSimulatorOn] = useState(() => {
        const saved = localStorage.getItem('isSimulatorOn');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [timeRange, setTimeRange] = useState('24h');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleSimulator = () => {
        const newState = !isSimulatorOn;
        setIsSimulatorOn(newState);
        localStorage.setItem('isSimulatorOn', JSON.stringify(newState));
    };

    // Fetch history based on selected range
    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/dashboard/history?period=${timeRange}`);
            if (res.data) {
                setChartData(res.data);
            }
        } catch (err) {
            console.error("History fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh when range changes or every 5s
    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, [timeRange]);

    // Initialize with prop data if 24h (optimization to show something immediately)
    useEffect(() => {
        if (timeRange === '24h' && data.history && data.history.length > 0 && chartData.length === 0) {
            setChartData(data.history);
        }
    }, [data.history]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white">Virtual Simulator</h2>
                    <button
                        onClick={toggleSimulator}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${isSimulatorOn
                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                            : 'bg-surface border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                    >
                        <Power size={18} className={isSimulatorOn ? "animate-pulse" : ""} />
                        <span className="font-medium">{isSimulatorOn ? 'Simulator Online' : 'Simulator Offline'}</span>
                    </button>

                    {/* Time Range Filter */}
                    <div className="flex bg-surface border border-white/10 rounded-lg p-1 ml-4">
                        {[
                            { id: 'current', label: 'Current Moment', icon: Activity },
                            { id: '60m', label: 'Last 60 Minutes', icon: Clock },
                            { id: '24h', label: 'Last 24 Hours', icon: BarChart2 },
                        ].map((range) => (
                            <button
                                key={range.id}
                                onClick={() => setTimeRange(range.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timeRange === range.id
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <range.icon size={14} />
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={onOpenMachineList}
                    className="text-sm text-gray-400 hover:text-primary transition-colors cursor-pointer border-b border-white/5 hover:border-primary/50 py-1"
                >
                    Real-time data stream from 500 virtual units
                </button>
            </div>

            {!isSimulatorOn ? (
                <div className="h-[600px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-surface/30">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Activity className="text-gray-600" size={32} />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Simulator is Offline</h3>
                    <p className="text-gray-400">Activate the simulator to view real-time signals and analytics</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
                    <div className="bg-surface border border-white/5 rounded-xl p-6 relative">
                        {loading && <div className="absolute top-4 right-4 text-xs text-primary animate-pulse">Updating...</div>}
                        <h3 className="text-lg font-medium text-white mb-4">Signals Received per Hour</h3>
                        <div className="h-[300px]">
                            <TrendChart data={chartData} type="signals" height="100%" period={timeRange} />
                        </div>
                    </div>

                    <div className="bg-surface border border-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Temperature Monitor</h3>
                        <div className="h-[300px]">
                            <TrendChart data={chartData} type="temperature" height="100%" period={timeRange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-surface border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Vibration Analysis</h3>
                            <div className="h-[250px]">
                                <TrendChart data={chartData} type="vibration" height="100%" period={timeRange} />
                            </div>
                        </div>
                        <div className="bg-surface border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Power Consumption</h3>
                            <div className="h-[250px]">
                                <TrendChart data={chartData} type="power" height="100%" period={timeRange} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
