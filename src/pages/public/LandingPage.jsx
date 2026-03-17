import React, { Suspense, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ArrowRight, MapPin, Camera, CheckCircle } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

// Vite-compatible lazy loading
const World = React.lazy(() =>
    import('../../components/ui/globe').then((module) => ({ default: module.World }))
);

const globeConfig = {
    pointSize: 4,
    globeColor: "#062056",
    showAtmosphere: true,
    atmosphereColor: "#FFFFFF",
    atmosphereAltitude: 0.1,
    emissive: "#062056",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.7)",
    ambientLight: "#38bdf8",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    autoRotate: true,
    autoRotateSpeed: 0.5,
};

const colors = ["#06b6d4", "#3b82f6", "#6366f1"];

const sampleArcs = [
    { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -22.9068, endLng: -43.1729, arcAlt: 0.1, color: colors[0] },
    { order: 2, startLat: 28.6139, startLng: 77.209, endLat: 3.139, endLng: 101.6869, arcAlt: 0.2, color: colors[1] },
    { order: 3, startLat: 40.7128, startLng: -74.006, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3, color: colors[2] },
    { order: 4, startLat: 35.6762, startLng: 139.6503, endLat: -33.8688, endLng: 151.2093, arcAlt: 0.35, color: colors[0] },
    { order: 5, startLat: 48.8566, startLng: 2.3522, endLat: 25.2048, endLng: 55.2708, arcAlt: 0.25, color: colors[1] },
    { order: 6, startLat: 1.3521, startLng: 103.8198, endLat: 37.5665, endLng: 126.978, arcAlt: 0.15, color: colors[2] },
    { order: 7, startLat: 55.7558, startLng: 37.6173, endLat: 39.9042, endLng: 116.4074, arcAlt: 0.4, color: colors[0] },
    { order: 8, startLat: -34.6037, startLng: -58.3816, endLat: 19.4326, endLng: -99.1332, arcAlt: 0.3, color: colors[1] },
];

const Home = () => {
    const stepsRef = useRef([]);

    useEffect(() => {
        gsap.fromTo(
            stepsRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out', delay: 0.3 }
        );
    }, []);

    return (
        <PageWrapper>
            <main className="flex-grow flex flex-col relative pb-20 sm:pb-32">
                {/* ── Hero Section with Globe ── */}
                <section className="relative z-10 flex flex-col items-center justify-center overflow-hidden min-h-[90vh] md:min-h-screen pt-16">
                    {/* Hero Text — always on top */}
                    <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 md:pt-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-300 text-sm font-medium mb-6 backdrop-blur-sm">
                                <span className="text-sm">✨</span>
                                Powered by AI & Smart Routing
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5 leading-tight">
                                Smart Public Service{' '}
                                <br className="hidden sm:block" />
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    Feedback System
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-blue-200/70 max-w-2xl mx-auto mb-8 leading-relaxed">
                                Report civic issues instantly. Track progress in real-time.
                                Make your city better, together.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                                <Link
                                    to="/report"
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 shadow-xl shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-2xl gap-2"
                                >
                                    Report an Issue
                                    <ArrowRight size={20} />
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl text-white bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5 gap-2"
                                >
                                    Staff Portal
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Globe — positioned behind text at the bottom */}
                    <div className="absolute w-full bottom-0 sm:bottom-0 h-[60vh] sm:h-auto sm:inset-y-0 z-10 flex items-end sm:items-center justify-center pointer-events-none opacity-60 sm:opacity-100">
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-full">
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        }>
                            <World data={sampleArcs} globeConfig={globeConfig} />
                        </Suspense>
                    </div>
                </section>

                {/* ── Stats Bar ── */}
                <section className="relative z-10 py-16">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center pt-8">
                        {[
                            { value: '10K+', label: 'Issues Reported' },
                            { value: '95%', label: 'Resolution Rate' },
                            { value: '24h', label: 'Avg Response' },
                            { value: '50+', label: 'Cities Active' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <p className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{stat.value}</p>
                                <p className="text-blue-200/60 text-sm tracking-wide font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── How It Works Section ── */}
                <section className="relative z-10 pb-28 sm:pb-36">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it works</h2>
                            <p className="text-blue-200/50 text-lg max-w-xl mx-auto">Three simple steps to make your city better</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                            {[
                                { icon: <MapPin className="text-cyan-400 w-7 h-7" />, title: '1. Spot the Issue', desc: 'Identify a public problem like a pothole or broken streetlight.' },
                                { icon: <Camera className="text-cyan-400 w-7 h-7" />, title: '2. Report Details', desc: 'Fill out a quick form with location, category, and optional photos.' },
                                { icon: <CheckCircle className="text-cyan-400 w-7 h-7" />, title: '3. Track & Resolve', desc: 'Officials get notified instantly and you track progress until resolved.' },
                            ].map((step, i) => (
                                <div
                                    key={i}
                                    ref={el => stepsRef.current[i] = el}
                                    className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-cyan-400/30 transition-all flex flex-col items-center text-center group backdrop-blur-sm"
                                >
                                    <div className="bg-cyan-400/10 p-4 rounded-xl mb-5 group-hover:scale-110 transition-transform">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-blue-200/50 leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


            </main>
        </PageWrapper>
    );
};

export default Home;
