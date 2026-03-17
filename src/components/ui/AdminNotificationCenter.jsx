import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Search, AlertCircle, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTeamMembers, sendMessageToWorker } from '../../services/api';

const AdminNotificationCenter = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Form State
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Fetch users when modal opens
    useEffect(() => {
        if (isOpen && users.length === 0) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const data = await getTeamMembers();
            // Filter only active users to avoid sending to disabled accounts
            setUsers(data.filter(u => u.is_active));
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load user list.');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();

        if (!selectedUser) {
            toast.error('Please select a recipient.');
            return;
        }

        try {
            setIsSending(true);
            await sendMessageToWorker({
                target_user_id: selectedUser.id,
                title: title.trim(),
                message: message.trim()
            });

            toast.success('Notification sent successfully!');
            // Reset form and close
            setSelectedUser(null);
            setSearchQuery('');
            setTitle('');
            setMessage('');
            onClose();
        } catch (error) {
            console.error('Failed to send notification:', error);
            const detail = error.response?.data?.detail;
            if (detail) {
                toast.error(typeof detail === 'string' ? detail : 'Failed to send alert.');
            }
        } finally {
            setIsSending(false);
        }
    };

    // Filter users based on search query (Name, Username, Email, Role, Department)
    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        return (
            fullName.includes(query) ||
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.role?.toLowerCase().includes(query) ||
            user.department?.toLowerCase().includes(query)
        );
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Global Notification</h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Broadcast an instant push alert</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300 bg-white dark:bg-zinc-800 shadow-sm p-1.5 rounded-full border border-slate-200 dark:border-zinc-700 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 overflow-y-auto">
                            <form id="notification-form" onSubmit={handleSendNotification} className="space-y-5">

                                {/* 1. Recipient Selection (Combobox) */}
                                <div className="space-y-1.5 relative">
                                    <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Recipient</label>

                                    {selectedUser ? (
                                        <div className="flex items-center justify-between p-3 border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm shrink-0 font-bold text-sm">
                                                    {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                        {selectedUser.first_name} {selectedUser.last_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 capitalize truncate">
                                                        {selectedUser.role} {selectedUser.department ? `· ${selectedUser.department.replace('_', ' ')}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedUser(null);
                                                    setSearchQuery('');
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors shrink-0"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    {loadingUsers ? (
                                                        <div className="w-4 h-4 border-2 border-slate-200 dark:border-zinc-700 border-t-indigo-500 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Search size={16} className="text-slate-400 dark:text-zinc-500" />
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search name, email, or role..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                                                />
                                            </div>

                                            {/* Dropdown Results */}
                                            <div className="max-h-48 overflow-y-auto border border-slate-100 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm custom-scrollbar">
                                                {filteredUsers.length === 0 ? (
                                                    <p className="p-4 text-sm text-slate-500 dark:text-zinc-400 text-center">No users found.</p>
                                                ) : (
                                                    filteredUsers.map((user) => (
                                                        <button
                                                            key={user.id}
                                                            type="button"
                                                            onClick={() => setSelectedUser(user)}
                                                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 border-b border-slate-50 dark:border-zinc-800/50 last:border-0 text-left transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                                                                {user.first_name[0]}{user.last_name[0]}
                                                            </div>
                                                            <div className="truncate flex-1">
                                                                <p className="text-sm font-semibold text-slate-800 dark:text-gray-100 truncate">
                                                                    {user.first_name} {user.last_name}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                                                    <span className="capitalize font-medium text-indigo-600 dark:text-indigo-400">{user.role}</span>
                                                                    {user.department && (
                                                                        <>
                                                                            <span>·</span>
                                                                            <span className="capitalize truncate">{user.department.replace('_', ' ')}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 2. Title Input */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Notification Title</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={50}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Emergency Reassignment"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                                    />
                                    <p className="text-[10px] text-right text-slate-400 dark:text-zinc-500 font-medium">
                                        {title.length}/50
                                    </p>
                                </div>

                                {/* 3. Message Body (Textarea) */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Message Body</label>
                                        <p className={`text-[10px] font-medium ${message.length >= 150 ? 'text-red-500' : 'text-slate-400 dark:text-zinc-500'}`}>
                                            {message.length}/150
                                        </p>
                                    </div>
                                    <textarea
                                        required
                                        maxLength={150}
                                        rows={3}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Enter the push notification text..."
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-800 transition-all resize-none custom-scrollbar"
                                    />
                                </div>

                                {/* Info Banner */}
                                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium leading-relaxed">
                                        This alert will be delivered directly to the user's secured device via secure Web Push protocol bypass if they actively have notifications enabled.
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Footer / CTA */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 shrink-0">
                            <button
                                type="submit"
                                form="notification-form"
                                disabled={isSending || !selectedUser || !title.trim() || !message.trim()}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all shadow-md shadow-indigo-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Send Alert <Send size={16} className="ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AdminNotificationCenter;
