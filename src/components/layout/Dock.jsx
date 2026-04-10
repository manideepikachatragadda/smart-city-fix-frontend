import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FloatingDock } from "@/components/ui/floating-dock.jsx";
import {
    IconHome,
    IconAlertTriangle,
    IconLayoutDashboard,
    IconListCheck,
    IconLogin,
    IconPower,
    IconSettings,
} from "@tabler/icons-react";
import useAuthStore from "../../contexts/AuthContext";
import SettingsModal from "../ui/SettingsModal";

export function FloatingDockDemo() {
    const { isAuthenticated, role, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const normalizedRole = role?.toLowerCase();
    const isLanding = location.pathname === '/';
    const iconColor = isLanding ? 'text-blue-100 group-hover:text-white transition-colors' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const links = [];

    // Home — always visible
    links.push({
        title: "Home",
        icon: <IconHome className={`h-full w-full ${iconColor}`} />,
        href: "/",
    });

    if (!isAuthenticated) {
        links.push({
            title: "Report Issue",
            icon: <IconAlertTriangle className={`h-full w-full ${iconColor}`} />,
            href: "/report",
        });
        links.push({
            title: "Staff Login",
            icon: <IconLogin className={`h-full w-full ${iconColor}`} />,
            href: "/login",
        });
    } else {
        // Dashboard
        links.push({
            title: "Dashboard",
            icon: <IconLayoutDashboard className={`h-full w-full ${iconColor}`} />,
            href: "/dashboard",
        });

        // Complaints — admin & manager
        if (normalizedRole === 'admin' || normalizedRole === 'manager') {
            links.push({
                title: "Complaints",
                icon: <IconListCheck className={`h-full w-full ${iconColor}`} />,
                href: "/complaints",
            });
        }

        // Report Issue
        links.push({
            title: "Report Issue",
            icon: <IconAlertTriangle className={`h-full w-full ${iconColor}`} />,
            href: "/report",
        });

        // Settings
        links.push({
            title: "Settings",
            icon: <IconSettings className={`h-full w-full ${iconColor}`} />,
            href: "#",
            onClick: () => setIsSettingsOpen(true),
        });

        // Logout
        links.push({
            title: "Logout",
            icon: <IconPower className="h-full w-full text-red-500" />,
            href: "#",
            onClick: handleLogout,
        });
    }

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                <FloatingDock
                    items={links}
                    desktopClassName={`backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border ${isLanding ? 'bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10' : 'bg-white/40 dark:bg-zinc-900/40 border-white/40 dark:border-white/10'} rounded-2xl md:rounded-full px-5 py-2 transition-colors duration-300`}
                    mobileClassName={`backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border ${isLanding ? 'bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10' : 'bg-white/40 dark:bg-zinc-900/40 border-white/40 dark:border-white/10'} rounded-2xl p-2 gap-3 transition-colors duration-300`}
                    itemClassName={isLanding ? 'bg-white/20 hover:bg-white/30 dark:bg-black/40 dark:hover:bg-black/60 shadow-sm' : 'bg-white/50 hover:bg-white/80 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/80 shadow-sm transition-colors duration-300'}
                />
            </div>
            {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
        </>
    );
}
