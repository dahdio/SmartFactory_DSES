import React from 'react';
import { WhatIfControls } from '../WhatIfControls';
import { Brain, TrendingUp } from 'lucide-react';

export const DSSView = ({ forecast }) => {
    // Default fallback if loading or null
    const fData = forecast || {
        reason: "Analyzing current operating parameters...",
        degradation: 0,
        current_efficiency: 0,
        projected_efficiency: 0,
        timeframe: "4 hours"
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-primary/20 rounded-lg text-primary">
                    <Brain size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Decision Support System</h2>
                    <p className="text-gray-400">Predictive analytics and scenario planning</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Control Panel */}
                <div className="md:col-span-2 space-y-6">
                    <WhatIfControls machineId="M-001" />

                    <div className="bg-surface border border-white/5 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="text-accent" />
                            <h3 className="font-medium text-white">Efficiency Forecast</h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Based on current operating parameters, overall plant efficiency is projected to degrade by <span className="text-white font-bold">{fData.degradation}%</span> over the next {fData.timeframe} due to {fData.reason.toLowerCase()}.
                        </p>
                        <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent transition-all duration-1000"
                                style={{ width: `${fData.projected_efficiency}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Current: {fData.current_efficiency}%</span>
                            <span>Projected: {fData.projected_efficiency}%</span>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="space-y-4">
                    <div className="bg-surface/50 border border-white/5 rounded-xl p-6">
                        <h4 className="font-bold text-white mb-2">System Logic</h4>
                        <ul className="space-y-2 text-sm text-gray-400 list-disc list-inside">
                            <li>Trend Analysis</li>
                            <li>Bottleneck Prediction</li>
                            <li>Energy Impact Simulation</li>
                            <li>Capacity Planning</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
