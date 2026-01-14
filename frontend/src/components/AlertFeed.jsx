import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Modal } from './common/Modal';

export const AlertFeed = ({ alerts }) => {
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [modalType, setModalType] = useState(null); // 'work_order' or 'details'

    const handleCreateWorkOrder = (alert) => {
        setSelectedAlert(alert);
        setModalType('work_order');
    };

    const handleViewDetails = (alert) => {
        setSelectedAlert(alert);
        setModalType('details');
    };

    const closeModal = () => {
        setSelectedAlert(null);
        setModalType(null);
    };

    return (
        <div className="space-y-4">
            {/* Modals */}
            <Modal
                isOpen={!!selectedAlert && modalType === 'work_order'}
                onClose={closeModal}
                title="Create Work Order"
            >
                {selectedAlert && (
                    <div className="space-y-4">
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                            <h4 className="font-bold text-primary mb-1">
                                Work Order #WO-{selectedAlert.machine_id.replace(/\D/g, '')}{selectedAlert.condition.length.toString().padStart(2, '0')}
                            </h4>
                            <p className="text-sm text-gray-300">Generated for machine {selectedAlert.machine_id}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Diagnosis</label>
                            <input type="text" readOnly value={selectedAlert.condition} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Recommended Action</label>
                            <textarea readOnly value={selectedAlert.action} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white h-24 resize-none" />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={() => { alert('Work Order Sent!'); closeModal(); }} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Submit Order</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={!!selectedAlert && modalType === 'details'}
                onClose={closeModal}
                title="Diagnostic Analysis"
            >
                {selectedAlert && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-danger/10 rounded-full text-danger">
                                <AlertTriangle size={32} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">{selectedAlert.condition}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">ID: {selectedAlert.machine_id}</span>
                                    <span className="text-xs text-danger font-bold">{Math.round(selectedAlert.confidence * 100)}% Confidence</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Reasoning Engine Output</h5>
                            <p className="text-gray-200 leading-relaxed bg-black/20 p-4 rounded-lg border border-white/5">
                                {selectedAlert.reasoning}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-surface border border-white/5 rounded-lg">
                                <span className="text-xs text-gray-500">Temperature</span>
                                <div className="text-xl font-mono text-danger">High</div>
                            </div>
                            <div className="p-3 bg-surface border border-white/5 rounded-lg">
                                <span className="text-xs text-gray-500">Vibration</span>
                                <div className="text-xl font-mono text-danger">Critical</div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white">Expert System Diagnostics</h3>
                <span className="text-xs text-secondary bg-white/5 px-2 py-1 rounded">200+ rules active</span>
            </div>

            {alerts.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
                    <CheckCircle className="mx-auto text-success mb-2" />
                    <p className="text-gray-400">All systems operating within normal parameters</p>
                </div>
            ) : (
                alerts.map((alert, idx) => (
                    <div key={idx} className="bg-surface border border-white/5 rounded-xl p-5 hover:border-primary/50 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-3">
                                <div className={`mt-1 bg-danger/10 p-2 rounded-lg h-fit`}>
                                    <AlertTriangle size={18} className="text-danger" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-gray-500">Machine ID: {alert.machine_id}</span>
                                        <span className="text-xs bg-danger text-white px-1.5 py-0.5 rounded font-bold">{Math.round(alert.confidence * 100)}% confidence</span>
                                    </div>
                                    <h4 className="font-semibold text-lg text-white">{alert.condition}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="pl-[52px] space-y-3">
                            <div>
                                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Diagnosis Reasoning</span>
                                <p className="text-sm text-gray-300 mt-1">{alert.reasoning}</p>
                            </div>

                            <div className="bg-background rounded-lg p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1 text-primary">
                                    <CheckCircle size={14} />
                                    <span className="text-xs font-bold uppercase">Recommended Action</span>
                                </div>
                                <p className="text-sm text-white">{alert.action}</p>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    onClick={() => handleCreateWorkOrder(alert)}
                                    className="bg-primary hover:bg-primary/90 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Create Work Order
                                </button>
                                <button
                                    onClick={() => handleViewDetails(alert)}
                                    className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors border border-white/10 hover:border-white/30"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
