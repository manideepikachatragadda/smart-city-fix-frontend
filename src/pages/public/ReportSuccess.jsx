import React, { useLayoutEffect, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { CheckCircle, ArrowRight, Activity, ShieldAlert } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

const ReportSuccess = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    useLayoutEffect(() => {
        gsap.fromTo(
            '.success-card',
            { scale: 0.9, opacity: 0, y: 30 },
            { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.2)', delay: 0.1 }
        );
        gsap.fromTo(
            '.success-item',
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.4 }
        );
    }, []);

    if (!state?.complaint_id) {
        return (
            <PageWrapper>
                <div className="flex-grow flex items-center justify-center dark:bg-zinc-950">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Invalid Session</h2>
                        <button onClick={() => navigate('/report')} className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">Return to Report Page</button>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <main className="flex-grow flex items-center justify-center p-4 py-12 relative overflow-hidden dark:bg-zinc-950">
                {/* Subtle background blob */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-200 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>

                <div className="success-card relative w-full max-w-lg bg-[#c7d2fe]/90 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-100 dark:border-zinc-800 p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-zinc-900/50 text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner dark:shadow-emerald-900/20">
                        <CheckCircle className="w-10 h-10 text-green-500 dark:text-emerald-400" />
                    </div>

                    <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Issue Reported!</h2>
                    <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
                        Thank you for your civic duty. Our AI has analyzed your report and routed it to the correct department.
                    </p>

                    <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-700/50 p-6 mb-8 text-left space-y-4">
                        <div className="success-item flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-zinc-700/60">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-300">
                                <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Activity size={18} /></span>
                                <span className="font-medium">Tracking ID</span>
                            </div>
                            <span className="font-mono font-bold text-slate-800 dark:text-white">#{state.complaint_id}</span>
                        </div>

                        <div className="success-item flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-zinc-700/60">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-300">
                                <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><CheckCircle size={18} /></span>
                                <span className="font-medium">AI Classification</span>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-zinc-200 capitalize bg-[#c7d2fe] dark:bg-zinc-800 px-3 py-1 rounded-md border border-slate-200 dark:border-zinc-700 shadow-sm">
                                {state.classification?.replace('_', ' ') || 'Pending'}
                            </span>
                        </div>

                        <div className="success-item flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-300">
                                <span className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><ShieldAlert size={18} /></span>
                                <span className="font-medium">Priority Assessed</span>
                            </div>
                            <span className={`font-bold capitalize px-3 py-1 rounded-md border shadow-sm ${state.priority_level === 'high' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                                state.priority_level === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
                                    'bg-green-50 dark:bg-emerald-900/30 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-800'
                                }`}>
                                {state.priority_level || 'Normal'}
                            </span>
                        </div>
                    </div>

                    <div className="success-item flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/track')}
                            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-medium rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all hover:-translate-y-0.5"
                        >
                            Track My Issue <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium rounded-2xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all hover:-translate-y-0.5"
                        >
                            Return to Homepage
                        </button>
                    </div>
                </div>
            </main>
        </PageWrapper>
    );
};

export default ReportSuccess;
