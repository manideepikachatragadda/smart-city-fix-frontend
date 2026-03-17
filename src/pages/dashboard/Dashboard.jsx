import React, { useEffect, useState, useRef } from 'react';

import {
    AlertTriangle, ShieldCheck, LayoutDashboard, ListTodo, Users, Network, MoreVertical, X, Trash2, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import {
    getDashboardMetrics, getAdminComplaints, updateComplaintStatus,
    getDepartmentComplaints, checkHealth, triggerEscalations, deleteComplaint
} from '../../services/api';
import useAuthStore from '../../contexts/AuthContext';
import WorkerDashboard from './WorkerDashboard';
import HierarchyGraph from '../../components/HierarchyGraph';
import TeamManagement from '../../components/TeamManagement';
import DashboardOverview from '../../components/dashboard/DashboardOverview';
import ComplaintsBoard from '../../components/dashboard/ComplaintsBoard';
import { subscribeToPushNotifications, isPushSubscribed } from '../../utils/pushNotifications';
import SendAlertModal from '../../components/ui/SendAlertModal';
import AdminNotificationCenter from '../../components/ui/AdminNotificationCenter';

const Dashboard = () => {
    const { logout, role: storeRole } = useAuthStore();
    const role = storeRole?.toLowerCase();

    const [activeTab, setActiveTab] = useState('overview');
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showAdminAlertModal, setShowAdminAlertModal] = useState(false);

    // Early return for 'worker' role to display their completely unique dashboard
    if (role === 'worker') {
        return <WorkerDashboard />;
    }

    const [metrics, setMetrics] = useState({
        overview: {},
        category_distribution: {},
        priority_distribution: {}
    });
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [healthStatus, setHealthStatus] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const promises = [
                getDashboardMetrics(),
                role === 'admin' ? getAdminComplaints() : getDepartmentComplaints(),
            ];

            if (role === 'admin') {
                promises.push(checkHealth().catch(() => null));
            }

            const results = await Promise.all(promises);
            const metricsData = results[0];
            const complaintsData = results[1];

            setMetrics(metricsData);
            setComplaints(complaintsData);

            if (role === 'admin') {
                const healthData = results[2];
                setHealthStatus(healthData ? 'healthy' : 'down');
            } else {
                setHealthStatus(null);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
            if (err.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [role]);

    // Auto-prompt for push notifications once per device
    useEffect(() => {
        if (!isPushSubscribed() && !localStorage.getItem('push-notification-prompted')) {
            localStorage.setItem('push-notification-prompted', 'true');
            // Small delay so the dashboard loads first before the browser prompt appears
            const timer = setTimeout(() => {
                subscribeToPushNotifications();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleUpdateStatus = async (complaintId, newStatus) => {
        try {
            await updateComplaintStatus(complaintId, newStatus);
            setSelectedComplaint(null);
            fetchData(); // Refresh data
            toast.success('Status updated successfully');
        } catch (err) {
            console.error('Failed to update status', err);
            toast.error('Failed to update status');
        }
    };

    const handleDeleteComplaint = async (complaintId) => {
        if (!window.confirm('Are you sure you want to permanently delete this complaint?')) return;
        try {
            await deleteComplaint(complaintId);
            setSelectedComplaint(null);
            fetchData();
            toast.success('Complaint deleted');
        } catch (err) {
            console.error('Failed to delete complaint', err);
            toast.error('Failed to delete complaint');
        }
    };

    const handleTriggerEscalations = async () => {
        try {
            await triggerEscalations();
            toast.success('Escalation cron triggered successfully');
            fetchData();
        } catch (err) {
            console.error('Failed to trigger escalations', err);
            toast.error('Failed to trigger escalations');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { id: 'tasks', label: 'Tasks & Issues', icon: <ListTodo size={18} /> },
    ];

    if (role === 'admin' || role === 'manager') {
        tabs.push({ id: 'team', label: 'Team', icon: <Users size={18} /> });
        tabs.push({ id: 'hierarchy', label: 'Hierarchy', icon: <Network size={18} /> });
    }

    return (
        <PageWrapper>
            <main className="flex-grow max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-24 sm:pb-32 w-full overflow-x-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
                                {role === 'admin' ? 'Command Center' : role === 'manager' ? 'Department Workspace' : 'Worker Workspace'}
                            </h1>
                            <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 mt-1">
                                {role === 'admin' ? 'Real-time overview of city issues' : role === 'manager' ? 'Manage your department metrics and tasks' : 'Track and update your assigned tasks'}
                            </p>
                        </div>
                        {healthStatus && role === 'admin' && (
                            <div className={`w-fit px-3 py-1 mt-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1 ${healthStatus === 'healthy' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                <ShieldCheck size={14} />
                                {healthStatus}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {role === 'manager' && (
                            <button onClick={() => setShowAlertModal(true)} className="flex items-center justify-center flex-1 sm:flex-none gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all shadow-sm shadow-indigo-200 font-medium whitespace-nowrap">
                                <Bell size={18} /> Send Alert
                            </button>
                        )}
                        {role === 'admin' && (
                            <div className="flex flex-wrap w-full sm:w-auto items-center gap-3">
                                <button onClick={() => setShowAdminAlertModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-sm shadow-violet-200 font-medium whitespace-nowrap">
                                    <Bell size={18} /> Broadcast Alert
                                </button>
                                <button onClick={handleTriggerEscalations} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 font-medium whitespace-nowrap">
                                    <AlertTriangle size={18} /> Trigger Escalations
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex px-1 space-x-2 bg-slate-100/50 dark:bg-zinc-800/50 p-1.5 rounded-2xl mb-8 overflow-x-auto custom-scrollbar max-w-full w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-300 shadow-sm border border-slate-200/50 dark:border-zinc-600/50'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="w-full">
                        {activeTab === 'overview' && (
                            <DashboardOverview metrics={metrics} role={role} />
                        )}

                        {activeTab === 'tasks' && (
                            <ComplaintsBoard complaints={complaints} role={role} setSelectedComplaint={setSelectedComplaint} refreshData={fetchData} />
                        )}

                        {activeTab === 'team' && (role === 'manager' || role === 'admin') && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <TeamManagement />
                            </div>
                        )}

                        {activeTab === 'hierarchy' && (role === 'manager' || role === 'admin') && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <HierarchyGraph />
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Action Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedComplaint(null)}></div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Task Details</h3>
                                <span className="font-mono text-xs text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded-md border border-slate-200 dark:border-zinc-700 shadow-sm">#{selectedComplaint.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {role === 'admin' && (
                                    <button onClick={() => handleDeleteComplaint(selectedComplaint.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full border border-transparent hover:border-red-200 transition-all" title="Delete Complaint">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-1.5 rounded-full border border-slate-200" title="Close">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 grid grid-cols-2 gap-y-4">
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1 font-medium">Description</p>
                                    <p className="text-slate-800 dark:text-zinc-200 text-sm bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl border border-slate-100 dark:border-zinc-700 leading-relaxed">{selectedComplaint.description}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1 font-medium">Contact Name</p>
                                    <p className="text-slate-800 dark:text-zinc-200 font-medium text-sm">{selectedComplaint.name || 'Anonymous'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1 font-medium">Phone</p>
                                    <p className="text-slate-800 dark:text-zinc-200 font-medium text-sm">{selectedComplaint.phone_number}</p>
                                </div>
                                {selectedComplaint.image_url && (
                                    <div className="col-span-2 mt-2">
                                        <p className="text-xs text-slate-500 mb-2 font-medium">Attached Image</p>
                                        <img src={selectedComplaint.image_url} alt="Issue" className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-sm" />
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100 dark:border-zinc-800 pt-6">
                                <p className="text-sm font-bold text-slate-800 dark:text-white mb-4">Update Status</p>
                                <div className="flex flex-wrap gap-3">
                                    {['pending', 'in_progress'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateStatus(selectedComplaint.id, status)}
                                            className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${selectedComplaint.status === status
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-indigo-900/50 scale-105'
                                                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
                                                }`}
                                        >
                                            {status.replace('_', ' ')}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handleUpdateStatus(selectedComplaint.id, 'resolved')}
                                        className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${selectedComplaint.status === 'resolved'
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 scale-105'
                                            : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                            }`}
                                    >
                                        Resolved (Review)
                                    </button>

                                    {/* Manager-only approval actions */}
                                    {role === 'manager' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedComplaint.id, 'closed')}
                                                className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${selectedComplaint.status === 'closed'
                                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md scale-105'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                                    }`}
                                            >
                                                Close Ticket
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedComplaint.id, 'rejected')}
                                                className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${selectedComplaint.status === 'rejected'
                                                    ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200 scale-105'
                                                    : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                                                    }`}
                                            >
                                                Reject Task
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <SendAlertModal isOpen={showAlertModal} onClose={() => setShowAlertModal(false)} />
            <AdminNotificationCenter isOpen={showAdminAlertModal} onClose={() => setShowAdminAlertModal(false)} />
        </PageWrapper>
    );
};

export default Dashboard;
