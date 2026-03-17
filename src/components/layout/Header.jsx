import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, LogOut, Sun, Moon } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import useAuthStore from '../../contexts/AuthContext';
import SettingsModal from '../ui/SettingsModal';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
    const { isAuthenticated, role, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    const { theme, setTheme } = useTheme();
    const isLanding = location.pathname === '/';
    const isLogin = location.pathname === '/login';
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    const getNavClasses = () => {
        if (isLogin) return 'bg-transparent border-transparent shadow-none';
        if (isLanding) return 'bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl hover:bg-white/20';
        return 'bg-white/40 dark:bg-zinc-900/40 border-white/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl';
    };

    const getRoleLabel = () => {
        const r = role?.toLowerCase();
        if (r === 'admin') return 'Admin';
        if (r === 'manager') return 'Manager';
        if (r === 'worker') return 'Worker';
        return 'Staff';
    };

    const toggleDropdown = useCallback(() => {
        if (!isDropdownOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
        setIsDropdownOpen(prev => !prev);
    }, [isDropdownOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                triggerRef.current && !triggerRef.current.contains(e.target)
            ) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const handleLogout = () => {
        setIsDropdownOpen(false);
        logout();
        navigate('/');
    };

    const handleOpenSettings = () => {
        setIsDropdownOpen(false);
        setIsSettingsOpen(true);
    };

    return (
        <>
            <div className="fixed top-4 left-0 w-full z-40 px-4 sm:px-6 flex justify-center pointer-events-none">
                <nav className={`pointer-events-auto backdrop-blur-2xl transition-all duration-300 rounded-full px-6 py-3 w-full max-w-5xl shadow-lg border ${getNavClasses()}`}>
                    <div className="flex justify-between items-center h-10">
                        {/* Brand */}
                        <div className="flex items-center">
                            <Link to="/" className={`flex flex-shrink-0 items-center gap-2 font-bold text-xl tracking-tight ${isLanding ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                <img src={logoImg} alt="SmartCity Fix Logo" className="h-8 w-8 rounded-md object-cover" />
                                <span>SmartCity Fix</span>
                            </Link>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center justify-end gap-3">
                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={`p-2 rounded-full focus:outline-none transition-colors ${isLanding ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-zinc-800'}`}
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {isAuthenticated ? (
                                <button
                                    ref={triggerRef}
                                    onClick={toggleDropdown}
                                    className={`flex items-center gap-2 focus:outline-none ${isLanding ? 'text-white' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <span className={`hidden sm:inline text-sm font-bold ${isLanding ? 'text-white/90' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {getRoleLabel()}
                                    </span>
                                </button>
                            ) : (
                                !isLogin && (
                                    <Link to="/login" className={`text-sm font-bold px-6 py-2.5 rounded-full transition-all flex items-center gap-2 ${isLanding ? 'bg-white/10 text-white hover:bg-white hover:text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none'}`}>
                                        Sign In
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </nav>
            </div>

            {/* Dropdown — rendered OUTSIDE the nav, position: fixed to viewport */}
            {isDropdownOpen && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top: `${dropdownPos.top}px`,
                        right: `${dropdownPos.right}px`,
                        zIndex: 9999,
                    }}
                    className="w-64 origin-top-right rounded-xl bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
                >
                    <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{getRoleLabel()} Account</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">SmartCity Fix Dashboard</p>
                    </div>
                    <div className="p-2">
                        <button
                            onClick={handleOpenSettings}
                            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <Settings size={16} className="text-gray-400 dark:text-zinc-500" />
                            Settings
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            )}

            {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
        </>
    );
};

export default Navbar;
