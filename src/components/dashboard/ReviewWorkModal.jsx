import React, { useState } from 'react';
import { X, CheckCircle, RotateCcw, Loader2, Eye, ImageOff } from 'lucide-react';
import { reviewComplaint } from '../../services/api';
import toast from 'react-hot-toast';

const ReviewWorkModal = ({ isOpen, complaint, onClose, onReviewSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRevertPrompt, setShowRevertPrompt] = useState(false);
    const [revertReason, setRevertReason] = useState('');

    if (!isOpen || !complaint) return null;

    const handleApprove = async () => {
        try {
            setIsProcessing(true);
            await reviewComplaint(complaint.id, 'approve');
            toast.success('Ticket approved and closed!', {
                icon: '✅',
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            onReviewSuccess();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to approve ticket.';
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRevert = async () => {
        if (!revertReason.trim()) {
            toast.error('Please provide a reason for reverting.');
            return;
        }
        try {
            setIsProcessing(true);
            await reviewComplaint(complaint.id, 'revert', revertReason.trim());
            toast.success('Ticket reverted back to In Progress.', {
                icon: '🔄',
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            setShowRevertPrompt(false);
            setRevertReason('');
            onReviewSuccess();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to revert ticket.';
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setShowRevertPrompt(false);
        setRevertReason('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={handleClose}
            ></div>

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden transform transition-all animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <Eye className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Review Work</h3>
                            <span className="font-mono text-xs text-slate-500">#{String(complaint.id).substring(0, 8)}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-1.5 rounded-full border border-slate-200 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto p-6 flex-1">
                    {/* Description */}
                    <div className="mb-6">
                        <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Description</p>
                        <p className="text-slate-800 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                            {complaint.description}
                        </p>
                    </div>

                    {/* Worker Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Assigned Worker</p>
                            <p className="text-slate-800 font-medium text-sm">
                                {complaint.assigned_worker_name || complaint.name || 'Worker'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Location</p>
                            <p className="text-slate-800 font-medium text-sm">{complaint.location || '—'}</p>
                        </div>
                    </div>

                    {/* Side-by-Side Comparison */}
                    <div className="mb-6">
                        <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Before / After Comparison</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Before */}
                            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                                <div className="px-4 py-2.5 bg-red-50 border-b border-red-100">
                                    <span className="text-xs font-bold uppercase tracking-wider text-red-600">📷 Before (Original)</span>
                                </div>
                                {complaint.image_url ? (
                                    <img
                                        src={complaint.image_url}
                                        alt="Original issue"
                                        className="w-full h-56 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-56 flex flex-col items-center justify-center text-slate-400">
                                        <ImageOff className="w-8 h-8 mb-2" />
                                        <span className="text-xs font-medium">No original image</span>
                                    </div>
                                )}
                            </div>

                            {/* After */}
                            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                                <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">✅ After (Proof of Work)</span>
                                </div>
                                {complaint.resolved_image_url ? (
                                    <img
                                        src={complaint.resolved_image_url}
                                        alt="Proof of work"
                                        className="w-full h-56 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-56 flex flex-col items-center justify-center text-slate-400">
                                        <ImageOff className="w-8 h-8 mb-2" />
                                        <span className="text-xs font-medium">No proof uploaded</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Revert Reason Prompt */}
                    {showRevertPrompt && (
                        <div className="mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Reason for reverting
                            </label>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 block p-3 outline-none transition-colors resize-none"
                                rows={3}
                                placeholder="Explain why this work is being reverted..."
                                value={revertReason}
                                onChange={(e) => setRevertReason(e.target.value)}
                                disabled={isProcessing}
                            />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row gap-3 shrink-0">
                    {!showRevertPrompt ? (
                        <>
                            <button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                Approve & Close
                            </button>
                            <button
                                onClick={() => setShowRevertPrompt(true)}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Revert / Reject
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleRevert}
                                disabled={isProcessing || !revertReason.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-sm shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RotateCcw className="w-4 h-4" />
                                )}
                                Confirm Revert
                            </button>
                            <button
                                onClick={() => { setShowRevertPrompt(false); setRevertReason(''); }}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewWorkModal;
