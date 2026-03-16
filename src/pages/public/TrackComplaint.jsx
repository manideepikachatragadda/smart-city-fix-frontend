import React, { useState } from 'react';
import { trackComplaint } from '../../services/api';
import PageWrapper from '../../components/layout/PageWrapper';
import { Search, Loader2, CheckCircle, Clock, Wrench, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const statuses = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'in_progress', label: 'In Progress', icon: Wrench },
    { key: 'resolved', label: 'Resolved', icon: ShieldCheck },
    { key: 'closed', label: 'Closed', icon: CheckCircle },
];

const TrackComplaint = () => {
    const [searchId, setSearchId] = useState('');
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        const trimmedId = searchId.trim();
        if (!trimmedId) return;

        setLoading(true);
        setError('');
        setComplaint(null);

        try {
            const data = await trackComplaint(trimmedId);
            setComplaint(data);
        } catch (err) {
            const status = err.response?.status;
            if (status === 404) {
                setError('Complaint not found. Please check your ID.');
            } else {
                setError('Failed to fetch complaint status.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusIndex = (status) => {
        return statuses.findIndex((s) => s.key === status?.toLowerCase()) ?? 0;
    };

    const currentIndex = getStatusIndex(complaint?.status);

    return (
        <PageWrapper>
            <main className="flex-grow flex flex-col items-center justify-start p-4 pt-24 pb-12 dark:bg-zinc-950 min-h-screen">
                <div className="w-full max-w-2xl text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">Track Complaint</h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-2">Enter your complaint ID below to see the latest status.</p>
                </div>

                {/* Search Card */}
                <div className="w-full max-w-2xl bg-[#c7d2fe] dark:bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-zinc-900/50 border border-slate-100 dark:border-zinc-800 z-10 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                className="pl-12 w-full rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 py-4 px-4 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                                placeholder="e.g. 12345"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !searchId.trim()}
                            className="flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-70 disabled:cursor-not-allowed sm:w-auto w-full"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track Status'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
                            {error}
                        </div>
                    )}
                </div>

                {/* Results Card */}
                {complaint && (
                    <div className="w-full max-w-2xl bg-[#c7d2fe] dark:bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-zinc-900/50 border border-slate-100 dark:border-zinc-800 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100 dark:border-zinc-800">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ticket #{String(complaint.complaint_id).padStart(5, '0')}</h3>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 capitalize">{complaint.department || 'Uncategorized'}</p>
                            </div>
                            <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                                {new Date(complaint.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Stepper Timeline */}
                        <div className="relative mb-12 mt-4">
                            {/* Line connecting the steps */}
                            <div className="absolute top-6 left-0 right-0 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full z-0 overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${currentIndex === -1 ? 0 : (currentIndex / (statuses.length - 1)) * 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between relative z-10">
                                {statuses.map((step, idx) => {
                                    const Icon = step.icon;
                                    const isCompleted = idx <= currentIndex;
                                    const isCurrent = idx === currentIndex;

                                    return (
                                        <div key={step.key} className="flex flex-col items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted ? 'bg-indigo-600 border-indigo-100 dark:border-indigo-900/30 text-white' : 'bg-[#c7d2fe] dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 text-slate-300 dark:text-zinc-600'} ${isCurrent ? 'ring-4 ring-indigo-50 dark:ring-indigo-900/20 scale-110 shadow-lg' : ''}`}>
                                                <Icon size={20} />
                                            </div>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-slate-700 dark:text-zinc-300' : 'text-slate-400 dark:text-zinc-600'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Issue Description</p>
                            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/50 rounded-2xl text-slate-700 dark:text-zinc-300 text-sm leading-relaxed">
                                {complaint.description}
                            </div>
                        </div>

                        {/* Proof of Work */}
                        {complaint.resolved_image_url && (
                            <div className="mt-8">
                                <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ImageIcon size={14} /> Resolution Proof
                                </p>
                                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm relative group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                    <img
                                        src={complaint.resolved_image_url}
                                        alt="Resolution proof"
                                        className="w-full h-64 object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </PageWrapper>
    );
};

export default TrackComplaint;
