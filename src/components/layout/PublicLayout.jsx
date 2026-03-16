import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import { FloatingDockDemo as Dock } from './Dock';

const PublicLayout = () => {
    const location = useLocation();
    const isLanding = location.pathname === '/';
    const isLogin = location.pathname === '/login';

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isLanding ? 'bg-[#040d21] dark:bg-background' : 'bg-[#e0e7ff] dark:bg-background'}`}>
            <Header />
            <main className={`flex-grow relative z-10 w-full ${isLanding || isLogin ? '' : 'pt-16 sm:pt-20'} bg-[#e0e7ff] dark:bg-background`}>
                {/* 
                  Using Outlet here means any child route of PublicLayout 
                  in App.jsx will be rendered inside this main block.
                */}
                <Outlet />
            </main>
            {/* Minimal Modern Footer */}
            {!isLogin && (
                <div className="px-4 sm:px-6 lg:px-8 pb-32 pt-12 relative z-10 w-full max-w-5xl mx-auto flex justify-center">
                    <footer className={`w-full flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-medium transition-colors duration-300 ${isLanding ? 'text-white/40' : 'text-slate-400 dark:text-zinc-500'}`}>
                        <p className="tracking-wide">© {new Date().getFullYear()} SmartCity Fix. All rights reserved.</p>
                        <div className="flex gap-8">
                            <a href="#" className={`transition-colors duration-300 ${isLanding ? 'hover:text-white' : 'hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Privacy Policy</a>
                            <a href="#" className={`transition-colors duration-300 ${isLanding ? 'hover:text-white' : 'hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Terms of Service</a>
                        </div>
                    </footer>
                </div>
            )}
            {/* The Floating Dock handles its own fixed positioning at the bottom */}
            <div className="relative z-50">
                <Dock />
            </div>
        </div>
    );
};

export default PublicLayout;
