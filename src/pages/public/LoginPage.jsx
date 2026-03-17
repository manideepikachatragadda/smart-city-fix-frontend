import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, User, ArrowRight, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import api, { forgotPassword, resetPassword, verifyOtp } from '../../services/api';
import useAuthStore from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset Flow States
    const [view, setView] = useState('login'); // 'login', 'forgot', 'verify', 'reset'
    const [resetEmail, setResetEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleLogin = async (e) => {
        // 1. THIS IS NON-NEGOTIABLE. It stops the URL reload.
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 2. Prepare data for FastAPI's OAuth2 (x-www-form-urlencoded)
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            // 3. Make the API Call
            const response = await api.post('/auth/token', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            // 4. Save Token & Redirect
            login(response.data.access_token);
            toast.success('Welcome back!', {
                icon: '👋',
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            navigate('/dashboard');
        } catch (err) {
            console.error('Login failed', err);
            setError('Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        if (e) e.preventDefault();
        if (!resetEmail) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await forgotPassword(resetEmail);
            toast.success('Reset code sent to your email.');
            setView('verify');
        } catch (err) {
            console.error('Forgot password failed', err);
            setError(err.response?.data?.detail || 'Failed to send reset code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await verifyOtp(resetEmail, otpString);
            toast.success('Code verified. Set a new password.');
            setView('reset');
        } catch (err) {
            console.error('Verify OTP failed', err);
            setError(err.response?.data?.detail || 'Invalid verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the 6-digit code.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await resetPassword(resetEmail, otpString, newPassword);
            toast.success('Password reset successfully! Please login.');

            // Clean up state and return to login
            setOtp(['', '', '', '', '', '']);
            setNewPassword('');
            setConfirmPassword('');
            setView('login');
        } catch (err) {
            console.error('Reset password failed', err);
            setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            {/* Aceternity-style dot pattern background */}
            <div className="absolute inset-0 bg-white dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] transition-colors duration-300"></div>

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-slate-50/80 dark:from-zinc-900/50 dark:via-zinc-950/20 dark:to-zinc-950/80 transition-colors duration-300"></div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 md:p-10 transition-colors duration-300">
                    {/* Brand header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 mb-4 transition-colors duration-300">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors duration-300">
                            {view === 'login' && 'Welcome back'}
                            {view === 'forgot' && 'Reset Password'}
                            {view === 'verify' && 'Verify Email'}
                            {view === 'reset' && 'Create New Password'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors duration-300 text-center px-4">
                            {view === 'login' && 'Sign in to your department dashboard'}
                            {view === 'forgot' && 'Enter your registered email to receive a reset code'}
                            {view === 'verify' && 'Check your email for the 6-digit verification code'}
                            {view === 'reset' && 'Please choose a strong and secure new password'}
                        </p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {view === 'login' && (
                            <motion.form
                                key="login-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleLogin}
                                className="space-y-5"
                            >
                                {/* Username */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 transition-colors duration-300">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            autoComplete="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className={`pl-10 w-full rounded-xl border ${error ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500' : 'border-gray-200 dark:border-zinc-700 focus:ring-blue-500'} bg-gray-50 dark:bg-zinc-800/50 py-3 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-zinc-800 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                                            placeholder="Enter your username"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 transition-colors duration-300">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`pl-10 w-full rounded-xl border ${error ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500' : 'border-gray-200 dark:border-zinc-700 focus:ring-blue-500'} bg-gray-50 dark:bg-zinc-800/50 py-3 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-zinc-800 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setError('');
                                            setView('forgot');
                                        }}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                {/* Submit button — plain HTML button, NO motion wrapper */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-200/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}

                        {view === 'forgot' && (
                            <motion.form
                                key="forgot-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleForgotPassword}
                                className="space-y-5"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 transition-colors duration-300">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className={`pl-10 w-full rounded-xl border ${error ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500' : 'border-gray-200 dark:border-zinc-700 focus:ring-blue-500'} bg-gray-50 dark:bg-zinc-800/50 py-3 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-zinc-800 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                                            placeholder="worker@smartcity.com"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-200/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                Send Reset Code
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setError('');
                                            setView('login');
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.98]"
                                    >
                                        <ArrowLeft size={18} />
                                        Back to Login
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {view === 'verify' && (
                            <motion.form
                                key="verify-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleVerifyOtp}
                                className="space-y-5"
                            >
                                <div className="space-y-1.5 flex flex-col items-center">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300 self-start">Verification Code</label>
                                    <div className="flex gap-2 sm:gap-3 justify-center w-full">
                                        {otp.map((data, index) => {
                                            return (
                                                <input
                                                    key={index}
                                                    type="text"
                                                    name="otp"
                                                    maxLength="1"
                                                    value={data}
                                                    onChange={e => handleOtpChange(e.target, index)}
                                                    onFocus={e => e.target.select()}
                                                    onKeyDown={e => handleOtpKeyDown(e, index)}
                                                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-xl border ${error && error.includes('OTP') ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500' : 'border-gray-200 dark:border-zinc-700 focus:ring-blue-500'} bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-zinc-800 transition-all`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading || otp.join('').length !== 6}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-200/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                Verify Code
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                    <div className="flex items-center justify-between mt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setError('');
                                                setView('login');
                                            }}
                                            className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
                                        >
                                            <ArrowLeft size={14} /> Back
                                        </button>
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={handleForgotPassword}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                </div>
                            </motion.form>
                        )}

                        {view === 'reset' && (
                            <motion.form
                                key="reset-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleResetPassword}
                                className="space-y-5"
                            >
                                <div className="space-y-1.5 pt-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 transition-colors duration-300">
                                            <KeyRound size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="pl-10 w-full rounded-xl border border-gray-200 dark:border-zinc-700 focus:ring-blue-500 bg-gray-50 dark:bg-zinc-800/50 py-3 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-zinc-800 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Confirm New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 transition-colors duration-300">
                                            <KeyRound size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`pl-10 w-full rounded-xl border ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500' : 'border-gray-200 dark:border-zinc-700 focus:ring-blue-500'} bg-gray-50 dark:bg-zinc-800/50 py-3 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-zinc-800 transition-all`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading || (newPassword && confirmPassword && newPassword !== confirmPassword)}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-200/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                Reset Password
                                                <Lock size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 dark:text-zinc-500 mt-6 transition-colors duration-300">
                        SmartCity Fix — Authorized personnel only
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
