import React, { useState } from 'react';
import { TrendChart } from '../TrendChart';
import { AlertFeed } from '../AlertFeed';
import { WhatIfControls } from '../WhatIfControls';
import { Activity, Zap, AlertCircle, BarChart3, FileText, CheckCircle, Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Modal } from '../common/Modal';
import { MetricDetailModal } from '../MetricDetailModal';

const StatCard = ({ title, value, subtext, icon: Icon, trend, trendValue, onClick, isClickable }) => (
    <div
        onClick={onClick}
        className={`bg-surface border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors ${isClickable ? 'cursor-pointer hover:bg-white/5' : ''}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
                <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg group-hover:bg-primary/20 group-hover:text-primary transition-colors text-gray-400">
                <Icon size={20} />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trend === 'positive' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                {trendValue || (trend === 'positive' ? '+2.4%' : '-1.2%')}
            </span>
            <span className="text-xs text-gray-500">{subtext}</span>
        </div>
    </div>
);

export const Overview = ({ data, stats, machineList, onOpenMachineList }) => {
    const [exportParams, setExportParams] = useState({ isOpen: false, status: 'idle' });
    const [selectedMetric, setSelectedMetric] = useState(null);

    // Fallback if stats aren't passed yet (defensive)
    const { production, energy, active } = stats || {
        production: { value: '94.2', trend: '2.4' },
        energy: { value: '87.8', trend: '-1.2' },
        active: { value: 500, trend: '0.0' }
    };

    // Derived Alert Trend (Simulated)
    const alertCount = data.overview.active_alerts;
    const alertTrend = alertCount > 5 ? `+${(alertCount / 5).toFixed(1)}%` : '-2.1%';

    const handleExport = () => {
        setExportParams({ isOpen: true, status: 'generating' });

        // Simulate processing time for UX
        setTimeout(() => {
            const doc = new jsPDF();
            const today = new Date().toLocaleDateString();
            const time = new Date().toLocaleTimeString();

            // Header
            doc.setFillColor(9, 9, 11);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text("Daily Management Report", 14, 20);
            doc.setFontSize(10);
            doc.setTextColor(200, 200, 200);
            doc.text(`Generated: ${today} ${time}`, 14, 30);
            doc.text("Smart Manufacturing Plant A", 140, 28);

            // Plant Summary Section
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.text("1. Plant Status Summary", 14, 55);

            autoTable(doc, {
                startY: 60,
                head: [['Metric', 'Value', 'Status']],
                body: [
                    ['Active Machines', `${data.overview.active_machines} / 500`, 'Normal'],
                    ['Production Output', `${production.value}%`, 'Optimal'],
                    ['Energy Efficiency', `${energy.value}%`, 'Below Target'],
                    ['Active Critical Alerts', `${data.alerts.filter(a => a.confidence > 0.9).length}`, 'Attention Needed']
                ],
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] }
            });

            // Critical Faults Section
            doc.text("2. Critical Faults & Diagnostics", 14, doc.lastAutoTable.finalY + 20);

            const alertRows = data.alerts.map(a => [a.machine_id, a.condition, a.action]);
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 25,
                head: [['Machine', 'Condition', 'Recommended Action']],
                body: alertRows.length ? alertRows : [['-', 'No active alerts', '-']],
                theme: 'striped',
                headStyles: { fillColor: [192, 57, 43] }
            });

            // Energy & Recommendations
            doc.text("3. Energy Optimization Recommendations", 14, doc.lastAutoTable.finalY + 20);
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            const recommendationText = `
Based on DSS analysis, the current energy efficiency is ${energy.value}%, which is below the target.
Simulations indicate that adjusting Shift A capacity to 100% and Shift B to 80% could stabilize power draw deviations.

Total projected savings: 12% energy reduction without compromising production quotas.
            `;
            doc.text(recommendationText, 14, doc.lastAutoTable.finalY + 30);

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.text('Confidential - Internal Use Only', 105, 290, { align: 'center' });
            }

            // Manual save to ensure filename is respected
            const filename = `SmartFactory_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportParams({ isOpen: true, status: 'success' });
        }, 1500);
    };

    const closeExportModal = () => {
        setExportParams({ isOpen: false, status: 'idle' });
    };

    return (
        <div className="space-y-8">
            <Modal isOpen={exportParams.isOpen} onClose={closeExportModal} title="Report Generation">
                <div className="py-8 text-center space-y-4">
                    {exportParams.status === 'generating' ? (
                        <>
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto animate-pulse">
                                <Loader2 size={32} className="animate-spin" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">Generating PDF...</h4>
                                <p className="text-gray-400 text-sm mt-2">Compiling charts, diagnostics, and energy metrics.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center text-success mx-auto">
                                <CheckCircle size={32} />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">Report Downloaded!</h4>
                                <p className="text-gray-400 text-sm mt-2">The daily management report has been saved to your downloads folder.</p>
                            </div>
                            <button onClick={closeExportModal} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                                Close
                            </button>
                        </>
                    )}
                </div>
            </Modal>

            {/* Metric Details Modal */}
            <MetricDetailModal
                isOpen={!!selectedMetric}
                onClose={() => setSelectedMetric(null)}
                metricType={selectedMetric}
                stats={stats}
                data={data}
                machineList={machineList}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">System Overview</h2>
                    <p className="text-gray-400">Real-time plant telemetry and diagnostics</p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <BarChart3 size={18} /> Export Daily Report
                </button>
            </div>

            {/* Overview Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Machines"
                    value={`${data.overview.active_machines} / ${active.value}`}
                    subtext="Operating normally"
                    icon={Activity}
                    trend={Number(active.trend) >= 0 ? 'positive' : 'negative'}
                    trendValue={`${Number(active.trend) > 0 ? '+' : ''}${active.trend}%`}
                    isClickable={true}
                    onClick={onOpenMachineList}
                />
                <StatCard
                    title="Production Output"
                    value={`${production.value}%`}
                    subtext="vs. last 24h"
                    icon={BarChart3}
                    trend={Number(production.trend) >= 0 ? 'positive' : 'negative'}
                    trendValue={`${Number(production.trend) > 0 ? '+' : ''}${production.trend}%`}
                    isClickable={true}
                    onClick={() => setSelectedMetric('production')}
                />
                <StatCard
                    title="Energy Efficiency"
                    value={`${energy.value}%`}
                    subtext="Below target"
                    icon={Zap}
                    trend={Number(energy.trend) >= 0 ? 'positive' : 'negative'}
                    trendValue={`${Number(energy.trend) > 0 ? '+' : ''}${energy.trend}%`}
                    isClickable={true}
                    onClick={() => setSelectedMetric('energy')}
                />
                <StatCard
                    title="Active Alerts"
                    value={data.overview.active_alerts}
                    subtext={`${data.alerts.filter(a => a.confidence > 0.9).length} critical`}
                    icon={AlertCircle}
                    trend={data.overview.active_alerts > 5 ? "negative" : "positive"}
                    trendValue={alertTrend}
                    isClickable={true}
                    onClick={() => setSelectedMetric('alerts')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Simulator Visuals and Diagnostics */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-white/5 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-white">Virtual Simulator</h3>
                            <span className="text-xs text-gray-500">500 machines monitored</span>
                        </div>
                        <TrendChart data={data.history} type="temperature" />
                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                            <TrendChart data={data.history} type="vibration" />
                            <TrendChart data={data.history} type="power" />
                        </div>
                    </div>

                    <div className="bg-surface border border-white/5 rounded-xl p-6">
                        <AlertFeed alerts={data.alerts} />
                    </div>
                </div>

                {/* Right Column: DSS Only */}
                <div className="space-y-6">
                    <WhatIfControls machineId="M-001" />
                </div>
            </div>
        </div>
    );
};
