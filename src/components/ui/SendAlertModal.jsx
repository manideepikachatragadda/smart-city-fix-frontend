import React, { useState, useEffect } from 'react';
import { X, Send, User, Type, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTeamMembers, sendMessageToWorker } from '../../services/api';

const SendAlertModal = ({ isOpen, onClose }) => {
    const [workers, setWorkers] = useState([]);
    const [loadingWorkers, setLoadingWorkers] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        worker_id: '',
        title: '',
        message: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchWorkers();
        }
    }, [isOpen]);

    const fetchWorkers = async () => {
        try {
            setLoadingWorkers(true);
            const data = await getTeamMembers();
            setWorkers(data.filter((u) => u.is_active && u.role?.toLowerCase() === 'worker'));
        } catch (err) {
            console.error('Failed to fetch workers:', err);
            toast.error('Failed to load team members.');
        } finally {
            setLoadingWorkers(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.worker_id) {
            toast.error('Please select a worker.');
            return;
        }

        try {
            setSubmitting(true);
            await sendMessageToWorker({
                target_user_id: parseInt(form.worker_id),
                title: form.title,
                message: form.message,
            });
            toast.success('Alert sent successfully!', {
                icon: '🔔',
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            setForm({ worker_id: '', title: '', message: '' });
            onClose();
        } catch (err) {
            const detail = err.response?.data?.detail;
            toast.error(typeof detail === 'string' ? detail : 'Failed to send alert.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-zinc-800 dark:to-zinc-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Send size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Send Alert</h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">Push notification to a team member</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300 bg-white dark:bg-zinc-800 shadow-sm p-1.5 rounded-full border border-slate-200 dark:border-zinc-700 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    {/* Worker Select */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Worker</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                            {loadingWorkers ? (
                                <div className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 text-sm">
                                    Loading workers...
                                </div>
                            ) : (
                                <select
                                    required
                                    value={form.worker_id}
                                    onChange={(e) => setForm({ ...form, worker_id: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm appearance-none cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-zinc-600"
                                >
                                    <option value="">Select a worker…</option>
                                    {workers.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.first_name} {w.last_name} — @{w.username}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        {!loadingWorkers && workers.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1.5">No active workers found in your team.</p>
                        )}
                    </div>

                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Title</label>
                        <div className="relative">
                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                            <input
                                type="text"
                                required
                                maxLength={100}
                                placeholder="e.g. Urgent Reassignment"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm transition-colors hover:border-slate-300 dark:hover:border-zinc-600"
                            />
                        </div>
                    </div>

                    {/* Message Textarea */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Message</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 text-slate-400 dark:text-zinc-500" size={16} />
                            <textarea
                                required
                                maxLength={500}
                                rows={4}
                                placeholder="Write the notification message…"
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm resize-none transition-colors hover:border-slate-300 dark:hover:border-zinc-600 custom-scrollbar"
                            />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 text-right">{form.message.length}/500</p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || loadingWorkers}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200/50 active:scale-[0.98]"
                    >
                        {submitting ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Sending…
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Send Notification
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SendAlertModal;
