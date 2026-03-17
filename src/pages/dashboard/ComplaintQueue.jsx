import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Search, Filter, AlertTriangle, ArrowRight } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { getAdminComplaints, getDepartmentComplaints } from '../../services/api';
import useAuthStore from '../../contexts/AuthContext';

const ComplaintQueue = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const data = role === 'admin'
                    ? await getAdminComplaints()
                    : await getDepartmentComplaints();
                setComplaints(data);
            } catch (err) {
                console.error('Failed to fetch complaints', err);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, [role]);

    useEffect(() => {
        if (!loading && complaints.length > 0) {
            gsap.fromTo(
                '.queue-item',
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, [loading, complaints]);

    const getPriorityBadge = (priority) => {
        const p = (priority || '').toLowerCase();
        if (p === 'high') return 'bg-red-100 text-red-700 border-red-200';
        if (p === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'resolved') return 'bg-green-100 text-green-700 border-green-200';
        if (s === 'in_progress') return 'bg-blue-100 text-blue-700 border-blue-200';
        if (s === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const filteredComplaints = complaints.filter(c =>
    (c.id?.toString().includes(searchTerm) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nlp_category?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <PageWrapper>
                        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800">Complaint Queue</h1>
                        <p className="text-slate-500 mt-1">Manage active tickets {role !== 'admin' && 'for your department'}.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search ID, Location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                            <Filter size={18} /> Filter
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 font-medium">
                                        <th className="px-6 py-4">Ticket ID</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Priority</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Logged Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 relative">
                                    {filteredComplaints.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-10 text-slate-500">No complaints found.</td></tr>
                                    ) : (
                                        filteredComplaints.map(item => (
                                            <tr
                                                key={item.id}
                                                onClick={() => navigate(`/complaints/${item.id}`)}
                                                className="queue-item hover:bg-slate-50/70 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-medium">#{String(item.id).padStart(5, '0')}</td>
                                                <td className="px-6 py-4 text-slate-800 capitalize font-medium">{item.nlp_category || 'Uncategorized'}</td>
                                                <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">{item.location}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border uppercase tracking-wider ${getPriorityBadge(item.priority_level)}`}>
                                                        {item.priority_level || 'Normal'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border capitalize ${getStatusBadge(item.status)}`}>
                                                        {(item.status || 'pending').replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-sm flex items-center justify-between">
                                                    {new Date(item.created_at || Date.now()).toLocaleDateString()}
                                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors transform group-hover:translate-x-1" />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </PageWrapper>
    );
};

export default ComplaintQueue;
