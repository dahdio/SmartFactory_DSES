import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TrendChart = ({ data, type }) => {
    const config = {
        temperature: { color: '#3b82f6', label: 'Temperature (°C)' },
        vibration: { color: '#10b981', label: 'Vibration (Hz)' },
        power: { color: '#f59e0b', label: 'Power (kW)' },
        signals: { color: '#8b5cf6', label: 'Signals / Hour' }
    };

    const { color, label } = config[type] || config.temperature;

    return (
        <div className="bg-surface rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-400">{label}</h3>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                    <span className="text-xs text-gray-500">Real-time</span>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            tick={{ fill: '#666', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(t) => new Date(t).getHours() + ':00'}
                        />
                        <YAxis
                            tick={{ fill: '#666', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area
                            type="monotone"
                            dataKey={type}
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#gradient-${type})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
