import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft, User, MapPin, AlignLeft, Phone, AlertTriangle, Activity, CheckCircle, ShieldAlert, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { getComplaintDetails, updateComplaintStatus } from '../../services/api';
import useAuthStore from '../../contexts/AuthContext';

const ComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchDetail = async () => {
        try {
            const data = await getComplaintDetails(id);
            setComplaint(data);
        } catch (err) {
            console.error('Failed to fetch complaint detail', err);
            toast.error('Could not load complaint details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useLayoutEffect(() => {
        if (!loading && complaint) {
            gsap.fromTo(
                '.split-view-panel',
                { opacity: 0, scale: 0.98 },
                { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
        }
    }, [loading, complaint]);

    const handleUpdateStatus = async (newStatus) => {
        setUpdating(true);
        try {
            await updateComplaintStatus(id, newStatus);
            toast.success(`Status updated to ${newStatus.replace('_', ' ')}!`);
            fetchDetail(); // Re-fetch to get updated state
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper>
                                <div className="flex-grow flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            </PageWrapper>
        );
    }

    if (!complaint) {
        return (
            <PageWrapper>
                                <div className="flex-grow flex items-center justify-center flex-col gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Complaint Not Found</h2>
                    <button onClick={() => navigate('/complaints')} className="text-indigo-600 hover:underline">Return to Queue</button>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
                        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 bg-[#c7d2fe] border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Ticket #{String(complaint.id).padStart(5, '0')}</h1>
                                <span className={`px-3 py-1 text-xs font-bold rounded-md border uppercase tracking-wider ${complaint.priority_level === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                                    complaint.priority_level === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                        'bg-green-100 text-green-700 border-green-200'
                                    }`}>
                                    {complaint.priority_level || 'Normal'} Priority
                                </span>
                            </div>
                            <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
                                <Clock size={14} /> Reported on {new Date(complaint.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {complaint.is_escalated && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 split-view-panel">
                        <div className="p-2 bg-red-100 rounded-full shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-red-800 font-bold">ESCALATED TICKET</h3>
                            <p className="text-red-600 text-sm mt-0.5">{complaint.escalation_reason || 'This ticket has breached SLA. Immediate action required.'}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Panel: Reporter Info & NLP Analysis */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* NLP AI Card */}
                        <div className="bg-[#c7d2fe] rounded-2xl p-6 border border-slate-200 shadow-sm split-view-panel">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                <Activity className="text-indigo-500 w-5 h-5" />
                                <h3 className="text-lg font-bold text-slate-800">AI Intelligence Analysis</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 mb-1 font-medium">Mapped Department</p>
                                    <p className="font-bold text-slate-800 capitalize">{complaint.department_assigned || 'Unassigned'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 mb-1 font-medium">NLP Category</p>
                                    <p className="font-bold text-slate-800 capitalize">{complaint.nlp_category || 'Pending'}</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 mb-1 font-medium">Severity Score</p>
                                    <p className="font-bold text-slate-800">{complaint.priority_score || 0}/10</p>
                                </div>
                            </div>
                        </div>

                        {/* Report Details Card */}
                        <div className="bg-[#c7d2fe] rounded-2xl p-6 border border-slate-200 shadow-sm split-view-panel">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                <AlignLeft className="text-slate-500 w-5 h-5" />
                                <h3 className="text-lg font-bold text-slate-800">Report Details</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-slate-500 mb-2 font-medium">Description provided by citizen</p>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-800 leading-relaxed text-sm">
                                        {complaint.description}
                                    </div>
                                </div>

                                {complaint.image_url && (
                                    <div>
                                        <p className="text-sm text-slate-500 mb-2 font-medium">Attached Media</p>
                                        <img
                                            src={complaint.image_url}
                                            alt="Issue Evidence"
                                            className="w-full max-h-96 object-cover rounded-xl border border-slate-200 shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Panel: Action & Contact */}
                    <div className="space-y-6">

                        {/* Action Panel */}
                        <div className="bg-[#c7d2fe] rounded-2xl p-6 border border-slate-200 shadow-sm split-view-panel relative overflow-hidden text-center sm:text-left">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>

                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-6 border-b border-slate-100 pb-4">
                                <ShieldAlert className="text-indigo-600 w-5 h-5" />
                                <h3 className="text-lg font-bold text-slate-800">Action Panel</h3>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-slate-500 mb-2 font-medium">Current Status</p>
                                <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border capitalize ${complaint.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-200' :
                                    complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        complaint.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    }`}>
                                    {complaint.status === 'resolved' && <CheckCircle size={16} />}
                                    {(complaint.status || 'pending').replace('_', ' ')}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-slate-500 font-medium">Update Status:</p>
                                {['pending', 'in_progress', 'resolved', 'rejected'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleUpdateStatus(status)}
                                        disabled={updating || complaint.status === status}
                                        className={`w-full py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-wide border transition-all text-center flex justify-center items-center ${complaint.status === status
                                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed hidden'
                                            : 'bg-[#c7d2fe] text-slate-700 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 shadow-sm hover:shadow active:scale-95'
                                            }`}
                                    >
                                        Mark as {status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Contact Info Panel */}
                        <div className="bg-[#c7d2fe] rounded-2xl p-6 border border-slate-200 shadow-sm split-view-panel">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider text-slate-500">Reporter Information</h3>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Full Name</p>
                                        <p className="text-sm font-bold text-slate-800">{complaint.name || 'Anonymous Citizen'}</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                        <Phone size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Phone</p>
                                        <p className="text-sm font-bold text-slate-800">{complaint.phone_number}</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 border-t border-slate-100 pt-4 mt-2">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 shrink-0">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Exact Location</p>
                                        <p className="text-sm font-medium text-slate-800 leading-tight mt-0.5">{complaint.location}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>

            </main>
        </PageWrapper>
    );
};

export default ComplaintDetail;
