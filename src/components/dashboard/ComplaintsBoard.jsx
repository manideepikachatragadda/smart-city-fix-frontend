import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { MoreVertical, UserPlus, Eye } from 'lucide-react';
import AssignWorkerModal from './AssignWorkerModal';
import ReviewWorkModal from './ReviewWorkModal';

const ComplaintsBoard = ({ complaints, role, setSelectedComplaint, refreshData }) => {
    const kanbanRef = useRef([]);
    const [assignModalData, setAssignModalData] = useState({ isOpen: false, complaintId: null });
    const [reviewModalData, setReviewModalData] = useState({ isOpen: false, complaint: null });

    const openReviewModal = (e, complaint) => {
        e.stopPropagation();
        setReviewModalData({ isOpen: true, complaint });
    };

    const closeReviewModal = () => {
        setReviewModalData({ isOpen: false, complaint: null });
    };

    const openAssignModal = (e, complaintId) => {
        e.stopPropagation();
        setAssignModalData({ isOpen: true, complaintId });
    };

    const closeAssignModal = () => {
        setAssignModalData({ isOpen: false, complaintId: null });
    };

    useEffect(() => {
        if (kanbanRef.current.length > 0 && role !== 'admin') {
            gsap.fromTo(
                kanbanRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
            );
        }
    }, [complaints, role]);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
            resolved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            closed: 'bg-slate-200 text-slate-700 border-slate-300',
        };
        return colors[status?.toLowerCase()] || 'bg-slate-100 text-slate-800 border-slate-200';
    };

    const getPriorityBadge = (priority) => {
        const p = (priority || '').toLowerCase();
        if (p === 'high') return 'bg-red-100 text-red-700 border-red-200';
        if (p === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    const kanbanColumns = [
        { title: 'Pending', status: 'pending', headerBg: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        { title: 'In Progress', status: 'in_progress', headerBg: 'bg-blue-100 text-blue-800 border-blue-200' },
        { title: 'Needs Verify', status: 'resolved', headerBg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        { title: 'Closed', status: 'closed', headerBg: 'bg-slate-200 text-slate-700 border-slate-300' }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mb-8">
            {role === 'admin' ? (
                /* Admin Data Table */
                <div className="bg-[#c7d2fe] dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col relative z-10 w-full">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Complaints</h3>
                    </div>
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-sm text-slate-500 dark:text-zinc-400 font-medium">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {complaints.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-10 text-slate-500">No complaints found.</td></tr>
                                ) : (
                                    complaints.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer" onClick={() => setSelectedComplaint(item)}>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-zinc-400">#{String(item.id).substring(0, 8)}</td>
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-zinc-200">{item.nlp_category || 'Uncategorized'}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-zinc-400 truncate max-w-[200px]">{item.location}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(item.status)}`}>
                                                    {(item.status || 'pending').toUpperCase().replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 text-sm">{new Date(item.created_at || Date.now()).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button className="text-slate-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800" onClick={(e) => { e.stopPropagation(); setSelectedComplaint(item); }}>
                                                    <MoreVertical size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Manager Kanban Board */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
                    {kanbanColumns.map((col, idx) => (
                        <div key={col.status} ref={el => kanbanRef.current[idx] = el} className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800/50 p-4 shadow-sm flex flex-col h-[600px] w-full">
                            <div className={`px-4 py-3 rounded-xl mb-4 text-sm font-bold flex justify-between items-center border ${col.headerBg}`}>
                                <span className="uppercase tracking-wide">{col.title}</span>
                                <span className="bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-md shadow-sm">
                                    {complaints.filter(c => c.status === col.status).length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                                {complaints.filter(c => c.status === col.status).length === 0 ? (
                                    <div className="text-center py-10 px-4 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl h-24 flex items-center justify-center">
                                        No tasks in this stage
                                    </div>
                                ) : (
                                    complaints.filter(c => c.status === col.status).map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedComplaint(item)}
                                            className="bg-[#c7d2fe] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">#{String(item.id).substring(0, 8)}</span>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${getPriorityBadge(item.priority_level)}`}>
                                                    {item.priority_level || 'Normal'}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1 line-clamp-2">{item.description}</h4>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mb-3">{item.location}</p>
                                            <div className="pt-3 border-t border-slate-100 dark:border-zinc-700 flex justify-between items-center">
                                                <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">{new Date(item.created_at || Date.now()).toLocaleDateString()}</span>
                                                <div className="flex gap-1 items-center">
                                                    {['pending', 'in_progress', 'rejected'].includes(item.status || 'pending') && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1.5 rounded transition-colors"
                                                            onClick={(e) => openAssignModal(e, item.id)}
                                                        >
                                                            <UserPlus size={12} /> {item.assigned_user_id ? 'Reassign' : 'Assign'}
                                                        </button>
                                                    )}
                                                    {item.status === 'resolved' && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1.5 rounded transition-colors"
                                                            onClick={(e) => openReviewModal(e, item)}
                                                        >
                                                            <Eye size={12} /> Review
                                                        </button>
                                                    )}
                                                    <button className="text-slate-300 group-hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-slate-50" onClick={(e) => { e.stopPropagation(); setSelectedComplaint(item); }}>
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AssignWorkerModal
                isOpen={assignModalData.isOpen}
                onClose={closeAssignModal}
                complaintId={assignModalData.complaintId}
                onAssignmentSuccess={() => {
                    if (refreshData) refreshData();
                }}
            />

            <ReviewWorkModal
                isOpen={reviewModalData.isOpen}
                complaint={reviewModalData.complaint}
                onClose={closeReviewModal}
                onReviewSuccess={() => {
                    if (refreshData) refreshData();
                }}
            />
        </div>
    );
};

export default ComplaintsBoard;
