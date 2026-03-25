import React, { useState, useEffect, useRef } from 'react';
import { X, User, Lock, UserPlus, Mail, Briefcase, Bell, MapPin, Loader2, Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCurrentUser, changePassword, createStaff } from '../../services/api';
import useAuthStore from '../../contexts/AuthContext';
import { subscribeToPushNotifications, isPushSubscribed, unsubscribeFromPushNotifications } from '../../utils/pushNotifications';

const SettingsModal = ({ isOpen, onClose }) => {
    const { role } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notifSubscribed, setNotifSubscribed] = useState(isPushSubscribed());
    const [notifLoading, setNotifLoading] = useState(false);

    // Password Form State
    const [passwords, setPasswords] = useState({ password: '', new_password: '' });

    const CATEGORIES = ['water', 'electricity', 'cleanliness', 'infrastructure', 'others'];

    // Register Form State
    const [newUser, setNewUser] = useState({
        username: '', email: '', first_name: '', last_name: '', password: '', role: 'worker', department: CATEGORIES[0], location: ''
    });

    // Location Suggestion State
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const searchTimeout = useRef(null);

    const handleLocationSearch = (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`)
            .then(res => res.json())
            .then(data => {
                setSuggestions(data);
                setShowSuggestions(true);
            })
            .catch(err => console.error('Error fetching suggestions:', err));
    };

    const handleLocationChange = (e) => {
        const value = e.target.value;
        setNewUser(prev => ({ ...prev, location: value }));

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            handleLocationSearch(value);
        }, 500);
    };

    const handleSuggestionClick = (suggestion) => {
        setNewUser(prev => ({ ...prev, location: suggestion.display_name }));
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();

                    if (data && data.display_name) {
                        setNewUser(prev => ({ ...prev, location: data.display_name }));
                        setSuggestions([]);
                        setShowSuggestions(false);
                        toast.success('Location found!');
                    } else {
                        toast.error('Could not determine exact address.');
                    }
                } catch (err) {
                    console.error('Reverse Geoding Error:', err);
                    toast.error('Failed to get address from coordinates.');
                } finally {
                    setIsLocating(false);
                }
            },
            (err) => {
                console.error('Geolocation Error:', err);
                setIsLocating(false);
                if (err.code === 1) {
                    toast.error('Location access denied. Please type your address.');
                } else {
                    toast.error('Failed to get your location.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        if (isOpen && activeTab === 'profile' && !userProfile) {
            fetchProfile();
        }
    }, [isOpen, activeTab]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getCurrentUser();
            setUserProfile(data);
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await changePassword(passwords);
            toast.success('Password changed successfully');
            setPasswords({ password: '', new_password: '' });
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = { ...newUser };

            // Managers can only create workers in their own department
            if (role === 'manager') {
                payload.role = 'worker';
                payload.department = userProfile?.department || CATEGORIES[0];
            }

            if (payload.role === 'admin') {
                delete payload.department;
            }
            await createStaff(payload);
            toast.success('User created successfully');
            setNewUser({ username: '', email: '', first_name: '', last_name: '', password: '', role: 'worker', department: CATEGORIES[0], location: '' });
        } catch (err) {
            toast.error(err.response?.data?.detail || err.response?.data?.detail?.[0]?.msg || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50 shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Settings & Profile</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300 bg-white dark:bg-zinc-800 shadow-sm p-1.5 rounded-full border border-slate-200 dark:border-zinc-700 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex border-b border-slate-200 dark:border-zinc-800 px-6 shrink-0 bg-slate-50 dark:bg-zinc-800/80">
                    <button
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                    {(role === 'admin' || role === 'manager') && (
                        <button
                            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'register' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                            onClick={() => setActiveTab('register')}
                        >
                            {role === 'manager' ? 'Add Worker' : 'Add User'}
                        </button>
                    )}
                    <button
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notifications' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        Notifications
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-4">
                            {loading && !userProfile ? (
                                <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
                            ) : userProfile ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-100 dark:border-zinc-700/50">
                                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                            <User size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-800 dark:text-white">{userProfile.first_name} {userProfile.last_name}</h4>
                                            <p className="text-slate-500 dark:text-zinc-400 text-sm">@{userProfile.username}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/50">
                                            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Email</p>
                                            <p className="text-slate-700 dark:text-zinc-300 font-medium truncate">{userProfile.email}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/50">
                                            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Role</p>
                                            <p className="text-slate-700 dark:text-zinc-300 font-medium capitalize">{userProfile.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-4">Profile not found.</p>
                            )}
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                                    <input
                                        type="password" required
                                        value={passwords.password} onChange={e => setPasswords({ ...passwords, password: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">New Password (min 6 chars)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                                    <input
                                        type="password" required minLength={6}
                                        value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <button disabled={loading} type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 mt-2">
                                {loading ? 'Updating...' : 'Change Password'}
                            </button>
                        </form>
                    )}

                    {/* REGISTER TAB */}
                    {activeTab === 'register' && (role === 'admin' || role === 'manager') && (
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">First Name</label>
                                    <input type="text" required value={newUser.first_name} onChange={e => setNewUser({ ...newUser, first_name: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Last Name</label>
                                    <input type="text" required value={newUser.last_name} onChange={e => setNewUser({ ...newUser, last_name: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                                        <input type="text" required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Role</label>
                                    <select disabled={role === 'manager'} value={role === 'manager' ? 'worker' : newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 dark:disabled:bg-zinc-800 disabled:text-slate-500 dark:disabled:text-zinc-500">
                                        <option value="worker">Worker</option>
                                        {role === 'admin' && <option value="manager">Manager</option>}
                                        {role === 'admin' && <option value="admin">Admin</option>}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                                    <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>

                            <div className="relative z-50">
                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                                    <input type="text" required autoComplete="off" value={newUser.location} onChange={handleLocationChange} onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }} onBlur={() => { setTimeout(() => setShowSuggestions(false), 200); }} placeholder="e.g. Block A, Room 101" className="w-full pl-9 pr-10 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <button type="button" onClick={handleLocateMe} disabled={isLocating} className="absolute inset-y-0 right-2 flex items-center justify-center p-1 text-slate-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 transition-colors disabled:opacity-50" title="Locate Me">
                                        {isLocating ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <Crosshair size={16} />}
                                    </button>
                                </div>
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-700 max-h-60 overflow-y-auto">
                                        {suggestions.map((suggestion, index) => (
                                            <div key={suggestion.place_id || index} className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-700 border-b border-slate-50 dark:border-zinc-700/50 last:border-0 transition-colors flex items-start gap-3" onClick={() => handleSuggestionClick(suggestion)}>
                                                <MapPin size={16} className="text-slate-400 dark:text-zinc-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-slate-700 dark:text-zinc-300 line-clamp-2">{suggestion.display_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {((role === 'admin' && newUser.role !== 'admin') || role === 'manager') && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Department</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                                        {role === 'manager' ? (
                                            <input type="text" disabled value={userProfile?.department?.replace('_', ' ') || CATEGORIES[0]} className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 capitalize cursor-not-allowed" />
                                        ) : (
                                            <select required value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none capitalize cursor-pointer">
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>)}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                                    <input type="password" required minLength={6} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>

                            <button disabled={loading} type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 mt-4 flex items-center justify-center gap-2">
                                <UserPlus size={18} /> {loading ? 'Creating...' : 'Create Account'}
                            </button>
                        </form>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-100 dark:border-zinc-700/50 mb-4">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm shadow-blue-100 dark:shadow-none">
                                    <Bell size={28} className={notifSubscribed ? 'animate-pulse' : ''} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Push Notifications</h4>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm">
                                    Stay updated instantly. Receive alerts directly to your device even when the dashboard is closed.
                                </p>
                            </div>

                            {notifSubscribed ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800/30 text-sm font-medium">
                                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Notifications are active on this device
                                    </div>
                                    <button
                                        disabled={notifLoading}
                                        onClick={async () => {
                                            setNotifLoading(true);
                                            const success = await unsubscribeFromPushNotifications();
                                            if (success) setNotifSubscribed(false);
                                            setNotifLoading(false);
                                        }}
                                        className="w-full py-3 bg-white dark:bg-transparent text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {notifLoading ? 'Disabling...' : 'Disable Notifications'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    disabled={notifLoading}
                                    onClick={async () => {
                                        setNotifLoading(true);
                                        const success = await subscribeToPushNotifications();
                                        if (success) setNotifSubscribed(true);
                                        setNotifLoading(false);
                                    }}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Bell size={18} />
                                    {notifLoading ? 'Enabling...' : 'Enable Notifications'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;