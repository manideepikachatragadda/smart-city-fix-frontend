import React, { useEffect, useState, useRef } from 'react';
import { Loader2, Sparkles, MapPin, Clock, Camera, Upload, X, ShieldAlert, Coffee } from 'lucide-react';
import { getDepartmentComplaints, resolveComplaint, getCurrentUser } from '../../services/api';
import toast from 'react-hot-toast';

const WorkerDashboard = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    // Per-card file state: { [complaintId]: File }
    const [selectedFiles, setSelectedFiles] = useState({});
    // Per-card preview URLs: { [complaintId]: string }
    const [previews, setPreviews] = useState({});
    const fileInputRefs = useRef({});

    const fetchData = async (userId) => {
        try {
            const data = await getDepartmentComplaints();
            const filteredData = data.filter(item =>
                item.assigned_user_id === userId &&
                item.status !== 'closed' &&
                item.status !== 'resolved'
            );
            setComplaints(filteredData);
        } catch (err) {
            console.error('Failed to fetch worker data', err);
            toast.error('Failed to load tasks');
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const user = await getCurrentUser();
                setCurrentUser(user);
                await fetchData(user.id);
            } catch (err) {
                console.error('Failed to initialize dashboard', err);
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Cleanup preview object URLs on unmount
    useEffect(() => {
        return () => {
            Object.values(previews).forEach(url => URL.revokeObjectURL(url));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFileChange = (complaintId, e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Revoke old preview if exists
        if (previews[complaintId]) {
            URL.revokeObjectURL(previews[complaintId]);
        }

        setSelectedFiles(prev => ({ ...prev, [complaintId]: file }));
        setPreviews(prev => ({ ...prev, [complaintId]: URL.createObjectURL(file) }));
    };

    const clearFile = (complaintId) => {
        if (previews[complaintId]) {
            URL.revokeObjectURL(previews[complaintId]);
        }
        setSelectedFiles(prev => {
            const copy = { ...prev };
            delete copy[complaintId];
            return copy;
        });
        setPreviews(prev => {
            const copy = { ...prev };
            delete copy[complaintId];
            return copy;
        });
        // Reset the native file input
        if (fileInputRefs.current[complaintId]) {
            fileInputRefs.current[complaintId].value = '';
        }
    };

    const handleResolve = async (complaintId) => {
        const file = selectedFiles[complaintId];
        if (!file) return;

        try {
            setProcessingId(complaintId);
            await resolveComplaint(complaintId, file);
            toast.success('Work verified and uploaded!', {
                icon: '👏',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            // Clean up file state and remove card
            clearFile(complaintId);
            setComplaints(prev => prev.filter(c => c.id !== complaintId));
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.message || 'Upload failed. Please try again.';
            toast.error(msg);
        } finally {
            setProcessingId(null);
        }
    };

    const getPriorityStyles = (priority) => {
        const p = (priority || '').toLowerCase();
        if (p === 'high') {
            return {
                badge: 'bg-red-500/20 text-red-500 border-red-500/30',
                glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            };
        }
        if (p === 'medium') {
            return {
                badge: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
                glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]'
            };
        }
        return {
            badge: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
            glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]'
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4 relative z-10" />
                <p className="text-zinc-400 font-medium tracking-wide relative z-10 animate-pulse">Syncing tasks...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden font-sans pb-24 selection:bg-indigo-500/30">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <main className="relative z-10 max-w-lg mx-auto px-4 py-8 pt-20 flex flex-col min-h-screen">
                {/* Header */}
                <header className="mb-8 flex-shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="text-sm font-bold tracking-widest text-indigo-400 uppercase">My Tasks</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                        Welcome back, <br className="block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            {currentUser?.first_name || currentUser?.name || 'Worker'}
                        </span>
                    </h1>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                        <ShieldAlert className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-300">
                            {complaints.length} active {complaints.length === 1 ? 'task' : 'tasks'}
                        </span>
                    </div>
                </header>

                {/* Stacked Cards Area */}
                <div className="flex-1 w-full space-y-5">
                    {complaints.length === 0 ? (
                        <div className="h-64 mt-12 flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                                <Coffee className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
                            <p className="text-zinc-400 tracking-wide text-sm font-medium">No pending tasks for today. ☕</p>
                        </div>
                    ) : (
                        complaints.map((item, idx) => {
                            const { badge, glow } = getPriorityStyles(item.priority_level);
                            const isProcessing = processingId === item.id;
                            const hasFile = !!selectedFiles[item.id];
                            const previewUrl = previews[item.id];

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex flex-col relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group ${glow}`}
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-1.5 rounded-lg border ${badge}`}>
                                            {item.priority_level || 'Normal'} Priority
                                        </span>
                                        <span className="text-[12px] font-bold text-zinc-500 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                                            #{String(item.id).substring(0, 6)}
                                        </span>
                                    </div>

                                    {/* Complaint Description */}
                                    <h2 className="text-lg font-bold text-white mb-4 leading-snug">
                                        {item.description}
                                    </h2>

                                    {/* Meta Details */}
                                    <div className="space-y-3 mb-5 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                            <span className="text-sm font-medium text-zinc-300 leading-tight">
                                                {item.location || 'Location not specified'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                {new Date(item.created_at || Date.now()).toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ─── Resolution Section ─── */}
                                    <div className="border-t border-white/5 pt-5 mt-auto space-y-4">
                                        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold">Proof of Work</p>

                                        {/* Image Preview */}
                                        {previewUrl && (
                                            <div className="relative group/preview rounded-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-300">
                                                <img
                                                    src={previewUrl}
                                                    alt="Proof preview"
                                                    className="w-full h-44 object-cover"
                                                />
                                                <button
                                                    onClick={() => clearFile(item.id)}
                                                    className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-colors"
                                                    title="Remove image"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {/* File Input */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={el => fileInputRefs.current[item.id] = el}
                                            className="hidden"
                                            onChange={(e) => handleFileChange(item.id, e)}
                                        />
                                        <button
                                            onClick={() => fileInputRefs.current[item.id]?.click()}
                                            disabled={isProcessing}
                                            className={`w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl border-2 border-dashed transition-all duration-300 text-sm font-semibold ${hasFile
                                                ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'
                                                : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-indigo-400'
                                                }`}
                                        >
                                            <Camera className="w-5 h-5" />
                                            {hasFile ? selectedFiles[item.id].name : 'Upload proof photo'}
                                        </button>

                                        {/* Submit Resolution Button */}
                                        <button
                                            onClick={() => handleResolve(item.id)}
                                            disabled={!hasFile || isProcessing}
                                            className="w-full relative overflow-hidden group/btn bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.5)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:active:scale-100 disabled:shadow-none"
                                        >
                                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out"></div>
                                            <div className="flex items-center justify-center gap-2 relative z-10">
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Uploading Proof...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-5 h-5" />
                                                        Submit Resolution
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
};

export default WorkerDashboard;
