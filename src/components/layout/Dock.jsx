import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FloatingDock } from "@/components/ui/floating-dock.jsx";
import {
    IconHome,
    IconAlertTriangle,
    IconLayoutDashboard,
    IconListCheck,
    IconLogin,
    IconLogout,
    IconSettings,
    IconSun,
    IconMoon,
} from "@tabler/icons-react";
import useAuthStore from "../../contexts/AuthContext";
import SettingsModal from "../ui/SettingsModal";
import { useTheme } from "../../contexts/ThemeContext";

export function FloatingDockDemo() {
    const { isAuthenticated, role, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { theme, setTheme } = useTheme();

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

    // Theme Toggle
    links.push({
        title: theme === 'dark' ? "Light Mode" : "Dark Mode",
        icon: theme === 'dark' ? <IconSun className={`h-full w-full ${iconColor}`} /> : <IconMoon className={`h-full w-full ${iconColor}`} />,
        href: "#",
        onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
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
            icon: <IconLogout className="h-full w-full text-red-400" />,
            href: "#",
            onClick: handleLogout,
        });
    }

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                <FloatingDock
                    items={links}
                    desktopClassName={`backdrop-blur-lg shadow-2xl border ${isLanding ? 'bg-black/40 border-white/10' : 'bg-[#c7d2fe]/80 border-indigo-100 dark:bg-zinc-900/80 dark:border-zinc-800'} rounded-2xl md:rounded-full px-5 py-2 transition-colors duration-300`}
                    mobileClassName={`backdrop-blur-lg shadow-2xl border ${isLanding ? 'bg-black/40 border-white/10' : 'bg-[#c7d2fe]/80 border-indigo-100 dark:bg-zinc-900/80 dark:border-zinc-800'} rounded-2xl p-2 gap-3 transition-colors duration-300`}
                    itemClassName={isLanding ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors duration-300'}
                />
            </div>
            {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
        </>
    );
}
