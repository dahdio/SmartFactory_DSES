import React, { useState } from 'react';
import { TrendChart } from '../TrendChart';
import { Power, Activity } from 'lucide-react';

export const SimulatorView = ({ data, onOpenMachineList }) => {
    const [isSimulatorOn, setIsSimulatorOn] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white">Virtual Simulator</h2>
                    <button
                        onClick={() => setIsSimulatorOn(!isSimulatorOn)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${isSimulatorOn
                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                            : 'bg-surface border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                    >
                        <Power size={18} className={isSimulatorOn ? "animate-pulse" : ""} />
                        <span className="font-medium">{isSimulatorOn ? 'Simulator Online' : 'Simulator Offline'}</span>
                    </button>
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
                    <div className="bg-surface border border-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Signals Received per Hour</h3>
                        <div className="h-[300px]">
                            <TrendChart data={data.history} type="signals" />
                        </div>
                    </div>

                    <div className="bg-surface border border-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Temperature Monitor</h3>
                        <div className="h-[300px]">
                            <TrendChart data={data.history} type="temperature" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-surface border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Vibration Analysis</h3>
                            <div className="h-[250px]">
                                <TrendChart data={data.history} type="vibration" />
                            </div>
                        </div>
                        <div className="bg-surface border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Power Consumption</h3>
                            <div className="h-[250px]">
                                <TrendChart data={data.history} type="power" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
