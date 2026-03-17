import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { FloatingDockDemo as Dock } from './Dock';
import useAuthStore from '../../contexts/AuthContext';

const DashboardLayout = () => {
    const { role } = useAuthStore();
    const isWorker = role?.toLowerCase() === 'worker';

    return (
        <div className="min-h-screen font-sans relative transition-colors duration-300 bg-slate-50 dark:bg-zinc-950">
            <Header />
            {/* The main content needs padding top for header, padding bottom for dock */}
            <main className="pt-28 pb-32 min-h-screen relative z-10">
                <Outlet />
            </main>
            {/* The Floating Dock handles its own fixed positioning at the bottom */}
            <div className="relative z-50">
                <Dock />
            </div>
        </div>
    );
};

export default DashboardLayout;
