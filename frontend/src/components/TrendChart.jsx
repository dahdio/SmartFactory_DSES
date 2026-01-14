import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TrendChart = ({ data, type, height = '100%', className = '', period = '24h' }) => {
    const config = {
        temperature: { color: '#3b82f6', label: 'Temperature (°C)' },
        vibration: { color: '#10b981', label: 'Vibration (Hz)' },
        power: { color: '#f59e0b', label: 'Power (kW)' },
        signals: { color: '#8b5cf6', label: 'Signals / Hour' }
    };

    const { color, label } = config[type] || config.temperature;

    const formatXAxis = (tick) => {
        try {
            const date = new Date(tick);
            if (period === '24h') return date.getHours() + ':00';
            if (period === '60m') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch { return ''; }
    };

    if (!data || data.length === 0) {
        return (
            <div className={`flex items-center justify-center text-gray-500 text-sm ${className}`} style={{ height }}>
                No Data Available
            </div>
        );
    }

    return (
        <div className={`w-full ${className}`} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
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
                        tickFormatter={formatXAxis}
                        minTickGap={period === '60m' ? 0 : 30}
                        interval={period === '60m' ? 'preserveStartEnd' : 'preserveStartEnd'}
                        ticks={period === '60m' && data.length > 1 ? [data[0].timestamp, data[data.length - 1].timestamp] : undefined}
                    />
                    <YAxis
                        tick={{ fill: '#666', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        labelFormatter={(t) => new Date(t).toLocaleString()}
                    />
                    <Area
                        type="monotone"
                        dataKey={type}
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#gradient-${type})`}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
