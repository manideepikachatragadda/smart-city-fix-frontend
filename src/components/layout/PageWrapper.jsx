import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

const PageWrapper = ({ children }) => {
    const nodeRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        // Scroll to top on route change
        window.scrollTo(0, 0);

        const el = nodeRef.current;

        // Page fade-in transition on initial mount
        gsap.fromTo(
            el,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
    }, [location.pathname]);

    const isLanding = location.pathname === '/';
    const bgClass = isLanding ? 'bg-transparent' : 'bg-[#e0e7ff] dark:bg-zinc-950';

    return (
        <div ref={nodeRef} className={`min-h-screen ${bgClass} text-slate-800 dark:text-gray-100 flex flex-col`}>
            {children}
        </div>
    );
};

export default PageWrapper;
