import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
    BarChart3, Clock, AlertTriangle, CheckCircle2,
    XCircle, Activity, PieChart as PieChartIcon, ShieldCheck
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardOverview = ({ metrics, role }) => {
    const statsRef = useRef([]);
    const distRef = useRef([]);

    useEffect(() => {
        if (statsRef.current.length > 0) {
            gsap.fromTo(
                statsRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', delay: 0.1 }
            );
        }
        if (distRef.current.length > 0) {
            gsap.fromTo(
                distRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: 'power2.out', delay: 0.3 }
            );
        }
    }, [metrics]);

    if (!metrics) return null;

    const statCards = [
        { label: 'Total Complaints', value: metrics.overview?.total_complaints || 0, icon: <BarChart3 className="text-indigo-600 dark:text-indigo-400" />, bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
        { label: 'Pending', value: metrics.overview?.pending_complaints || 0, icon: <Clock className="text-yellow-600 dark:text-yellow-400" />, bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
        { label: 'In Progress', value: metrics.overview?.in_progress_complaints || 0, icon: <Activity className="text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-50 dark:bg-blue-900/30' },
        { label: 'Need Verify', value: metrics.overview?.resolved_complaints || 0, icon: <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
        { label: 'Closed', value: metrics.overview?.closed_complaints || 0, icon: <ShieldCheck className="text-slate-600 dark:text-slate-400" />, bg: 'bg-slate-100 dark:bg-slate-800' },
        { label: 'Rejected', value: metrics.overview?.rejected_complaints || 0, icon: <XCircle className="text-red-600 dark:text-red-400" />, bg: 'bg-red-50 dark:bg-red-900/30' },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {statCards.map((stat, i) => (
                    <div
                        key={i}
                        ref={el => statsRef.current[i] = el}
                        className="bg-white dark:bg-zinc-800 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-3 relative overflow-hidden group"
                    >
                        <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                            {stat.icon}
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <h3 className="text-gray-500 dark:text-zinc-400 text-xs font-medium mt-1 uppercase tracking-wider">{stat.label}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Distributions - Visible to Manager and Admin */}
            {role !== 'worker' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 w-full max-w-full overflow-hidden">
                    {/* Category Distribution */}
                    <div
                        ref={el => distRef.current[0] = el}
                        className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-slate-200 dark:border-zinc-700 shadow-sm w-full"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <PieChartIcon className="text-indigo-500 w-5 h-5" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Category Overview</h3>
                        </div>
                        <div className="flex flex-col items-center">
                            {Object.entries(metrics.category_distribution || {}).length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-zinc-400">No data available.</p>
                            ) : (
                                <>
                                    <div className="w-full h-[220px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={Object.entries(metrics.category_distribution || {}).map(([key, val]) => ({ name: key.replace('_', ' '), value: val }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    stroke="none"
                                                    isAnimationActive={true}
                                                >
                                                    {Object.entries(metrics.category_distribution || {}).map((entry, index) => {
                                                        const colors = ['#6366f1', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                                    })}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                                        {Object.entries(metrics.category_distribution || {}).map(([key, val], idx) => {
                                            const colors = ['#6366f1', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                                            const color = colors[idx % colors.length];
                                            return (
                                                <div key={key} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300 font-medium">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                                                    <span className="capitalize">{key.replace('_', ' ')}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Priority Distribution */}
                    <div
                        ref={el => distRef.current[1] = el}
                        className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-slate-200 dark:border-zinc-700 shadow-sm flex flex-col w-full"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <AlertTriangle className="text-orange-500 dark:text-orange-400 w-5 h-5" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Priority Levels</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                            {Object.entries(metrics.priority_distribution || {}).length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-zinc-400 col-span-full">No data available.</p>
                            ) : (
                                Object.entries(metrics.priority_distribution || {}).map(([key, val]) => {
                                    const colors = {
                                        low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50',
                                        medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
                                        high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50'
                                    };
                                    const colorClass = colors[key.toLowerCase()] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700';
                                    return (
                                        <div key={key} className={`px-3 py-4 rounded-xl border flex flex-col items-center justify-center transition-colors ${colorClass}`}>
                                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-80 mb-1">{key}</span>
                                            <span className="text-2xl sm:text-3xl font-extrabold">{val}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardOverview;
