import React, { useState, useEffect } from 'react';
import { getTeamMembers, removeWorker } from '../services/api';
import toast from 'react-hot-toast';
import { Trash2, Shield, Briefcase, User, Mail } from 'lucide-react';

const TeamManagement = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                setLoading(true);
                const data = await getTeamMembers();
                // Filter out inactive users on the frontend
                setTeam(data.filter((user) => user.is_active));
            } catch (error) {
                console.error('Failed to fetch team members:', error);
                toast.error('Failed to load team data.');
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, []);

    const handleDelete = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to remove ${userName} from your team?`)) {
            try {
                await removeWorker(userId);
                toast.success(`${userName} has been removed.`);
                setTeam((prev) => prev.filter((u) => u.id !== userId));
            } catch (error) {
                console.error('Failed to remove worker:', error);
                toast.error('Failed to remove worker.');
            }
        }
    };

    const renderRoleIcon = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return <Shield size={16} className="text-purple-600" />;
            case 'manager':
                return <Briefcase size={16} className="text-blue-600" />;
            default:
                return <User size={16} className="text-emerald-600" />;
        }
    };

    const getRoleBadgeClasses = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'manager':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-emerald-100 text-emerald-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 bg-[#c7d2fe] dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-8 shadow-sm w-full">
                <div className="w-8 h-8 border-4 border-indigo-200 dark:border-zinc-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="mb-8 bg-[#c7d2fe] dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col relative w-full">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Team Management</h3>
                <span className="text-sm font-medium text-slate-500 dark:text-zinc-400 bg-[#c7d2fe] dark:bg-zinc-800 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-700 shadow-sm">
                    {team.length} Member{team.length !== 1 && 's'}
                </span>
            </div>

            <div className="p-6">
                {team.length === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800">
                        <User className="mx-auto h-12 w-12 text-slate-300 dark:text-zinc-600 mb-3" />
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">No team members</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">You have no workers assigned to your team yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {team.map((user) => (
                            <div
                                key={user.id}
                                className="bg-[#c7d2fe] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl p-5 shadow-sm hover:shadow-md dark:hover:shadow-zinc-800/50 transition-shadow relative group flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-slate-100 dark:bg-zinc-800`}>
                                            {renderRoleIcon(user.role)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                                                {user.first_name} {user.last_name}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium capitalize mt-0.5">
                                                {user.username}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Indicator */}
                                    <div title={user.is_active ? 'Active' : 'Inactive'} className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200 dark:shadow-none"></div>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <Mail size={14} className="text-slate-400 dark:text-zinc-500" />
                                    <span className="text-xs text-slate-500 dark:text-zinc-400 truncate">{user.email}</span>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-zinc-800 items-center justify-between">
                                    <div className="flex gap-2">
                                        <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded border ${getRoleBadgeClasses(user.role)} border-transparent dark:border-transparent dark:bg-opacity-20`}>
                                            {user.role}
                                        </span>
                                        {user.department && (
                                            <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                                                {user.department}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleDelete(user.id, `${user.first_name} ${user.last_name}`)}
                                        className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                        title="Remove Worker"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamManagement;
