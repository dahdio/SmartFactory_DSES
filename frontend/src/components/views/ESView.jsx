import React, { useState, useEffect } from 'react';
import { AlertFeed } from '../AlertFeed';
import { ShieldCheck, Database, X, FileText, Wrench } from 'lucide-react';
import api from '../../api';

export const ESView = ({ alerts }) => {
    // State for Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // State for Modals
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [rules, setRules] = useState([]);
    const [logs, setLogs] = useState([]);

    // Fetch Rules when modal opens
    useEffect(() => {
        if (showRulesModal) {
            api.get('/es/rules').then(res => setRules(res.data)).catch(console.error);
        }
    }, [showRulesModal]);

    // Fetch Logs when modal opens
    useEffect(() => {
        if (showLogsModal) {
            api.get('/maintenance/logs').then(res => setLogs(res.data)).catch(console.error);
        }
    }, [showLogsModal]);

    // Search Logic
    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (q.length > 2) {
            try {
                const res = await api.get(`/es/search?q=${q}`);
                setSearchResults(res.data);
            } catch (err) {
                console.error(err);
            }
        } else {
            setSearchResults([]);
        }
    };

    // Apply Fix Logic
    const handleApplyFix = async (rule, index) => {
        try {
            await api.post('/maintenance/log', {
                machine_id: 'M-050', // Demo ID
                diagnosis_id: rule.id,
                technician_action: `Applied Fix: ${rule.action}`,
                notes: `System recommended action applied by technician.`,
                resolved: true
            });
            alert(`Fix Applied: ${rule.action}`);
        } catch (err) {
            alert('Failed to log fix');
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col relative">
            {/* Modals Overlay */}
            {(showRulesModal || showLogsModal) && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 backdrop-blur-sm">
                    <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] flex flex-col relative">
                        <button
                            onClick={() => { setShowRulesModal(false); setShowLogsModal(false); }}
                            className="absolute right-4 top-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            {showRulesModal ? <Database size={20} /> : <FileText size={20} />}
                            {showRulesModal ? 'Knowledge Base (Active Rules)' : 'Maintenance Logs'}
                        </h3>

                        <div className="flex-1 overflow-auto space-y-2 pr-2">
                            {showRulesModal ? (
                                rules.length > 0 ? rules.map((r, i) => (
                                    <div key={i} className="bg-black/40 p-3 rounded-lg border border-white/5 flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-primary">{r.diagnosis}</div>
                                            <div className="text-sm text-gray-400">Action: {r.action}</div>
                                            <div className="text-xs text-gray-500 mt-1">Keywords: {r.symptom_keywords?.join(', ')}</div>
                                        </div>
                                        <div className="text-xs font-mono bg-white/10 px-2 py-1 rounded">{r.severity || 'N/A'}</div>
                                    </div>
                                )) : <div className="text-gray-500">Loading rules or no rules found...</div>
                            ) : (
                                logs.length > 0 ? logs.map((l, i) => (
                                    <div key={i} className="bg-black/40 p-3 rounded-lg border border-white/5">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-white">{l.fault_rules?.diagnosis || 'System Event'}</span>
                                            <span className="text-xs text-gray-500">{new Date(l.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div className="text-sm text-gray-300 mt-1">{l.technician_action}</div>
                                        <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                            <Wrench size={10} /> {l.resolved ? 'RESOLVED' : 'PENDING'}
                                        </div>
                                    </div>
                                )) : <div className="text-center text-gray-500 py-8">No maintenance logs found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/20 rounded-lg text-success">
                        <ShieldCheck size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Expert System Diagnostics</h2>
                </div>
                <button
                    onClick={() => setShowRulesModal(true)}
                    className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                    <Database size={14} />
                    <span>200+ Rules Active</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="lg:col-span-2 h-full flex flex-col">
                    <div className="bg-surface border border-white/5 rounded-xl p-6 flex-1 overflow-auto">
                        <AlertFeed alerts={alerts} />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Technical Diagnosis Assistant */}
                    <div className="bg-surface border border-white/5 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white">Technician Diagnosis Assistant</h3>
                            <button
                                onClick={() => setShowLogsModal(true)}
                                className="text-xs text-primary hover:text-primary/80"
                            >
                                View Logs
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    placeholder="Search fault codes, symptoms..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                <div className="absolute right-3 top-2.5">
                                    <Database size={14} className="text-gray-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                    {searchResults.length > 0 ? 'Search Results' : 'System Knowledge'}
                                </p>

                                {(searchResults.length > 0 ? searchResults : [
                                    // Fallback entries if no search to keep UI populated
                                    { id: 1, diagnosis: "Bearing Seizure Warning", confidence: 0.95, action: "Replace Bearing Assembly" },
                                    { id: 2, diagnosis: "Motor Phase Imbalance", confidence: 0.88, action: "Check Electrical Phases" },
                                    { id: 3, diagnosis: "Emergency Stop Circuit", confidence: 0.99, action: "Reset Safety Circuit" }
                                ]).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
                                                ID-{item.id}
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-300 group-hover:text-white">{item.diagnosis}</div>
                                                <div className="text-xs text-gray-500">Confidence: {item.confidence ? (item.confidence * 100).toFixed(0) : 90}%</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleApplyFix(item, i)}
                                            className="text-xs bg-white/5 hover:bg-primary hover:text-white px-2 py-1 rounded transition-colors"
                                        >
                                            Apply Fix
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-white/5 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Inference Engine Status</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Rule Processing Cost</span>
                                    <span className="text-success">12ms</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full"><div className="w-[15%] bg-success h-full rounded-full"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Knowledge Base Hit Rate</span>
                                    <span className="text-primary">98.5%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full"><div className="w-[98%] bg-primary h-full rounded-full"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
