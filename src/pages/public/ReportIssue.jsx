import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Camera, MapPin, AlignLeft, User, Phone, Upload, X, Image as ImageIcon, Crosshair, Loader2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { submitComplaint } from '../../services/api';

import toast from 'react-hot-toast';

const Report = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        location: '',
        description: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
        setFormData(prev => ({ ...prev, location: value }));

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            handleLocationSearch(value);
        }, 500);
    };

    const handleSuggestionClick = (suggestion) => {
        setFormData(prev => ({ ...prev, location: suggestion.display_name }));
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
                        setFormData(prev => ({ ...prev, location: data.display_name }));
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
        // Staggered slide-in-up animation for form input fields
        const inputs = formRef.current.querySelectorAll('.gsap-input');
        gsap.fromTo(
            inputs,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
        );
    }, []);

    const handleChange = (e) => {
        let { name, value } = e.target;
        
        if (name === 'phone_number') {
            // Only allow digits, plus, minus, spaces, and parentheses
            value = value.replace(/[^0-9+\-\s()]/g, '');
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!imageFile) {
                setError('Photo evidence is required.');
                setLoading(false);
                return;
            }

            const payload = {
                phone_number: formData.phone_number,
                location: formData.location,
                description: formData.description,
                name: formData.name,
                email: formData.email,
            };

            const response = await submitComplaint(payload, imageFile);

            const generatedId = response.id || response.complaint_id || 'UNKNOWN';
            const classification = response.classification || response.nlp_category || 'Uncategorized';
            const priority_level = response.priority || response.priority_level || 'pending';
            const estimated_resolution_time = response.estimated_resolution_time || null;

            toast.success('Complaint submitted successfully!');
            navigate('/success', {
                state: {
                    complaint_id: generatedId,
                    classification,
                    priority_level,
                    estimated_resolution_time
                }
            });

        } catch (err) {
            console.error(err);
            setError('Failed to submit the issue. Please try again.');
            toast.error('Failed to submit the issue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-12 relative overflow-hidden">
                {/* Subtle background blob */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>

                <div className="relative w-full max-w-2xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-100 dark:border-zinc-800 p-6 md:p-10 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-zinc-900/50">
                    <div className="relative w-full max-w-2xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-100 dark:border-zinc-800 p-6 md:p-10 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-zinc-900/50">
                        <div className="mb-8 text-center gsap-input">
                            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Report an Issue</h2>
                            <p className="text-slate-500 dark:text-zinc-400 mt-2">Help us build a smarter city by reporting civic problems.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 gsap-input">
                                {error}
                            </div>
                        )}

                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

                            {/* Contact Info Group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1 gsap-input">
                                    <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Phone Number *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            required
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            className="pl-10 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-white dark:hover:bg-zinc-700/80"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1 gsap-input">
                                    <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Email Address *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-10 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-white dark:hover:bg-zinc-700/80"
                                            placeholder="Receive tracking updates"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1 gsap-input">
                                <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Full Name *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-white dark:hover:bg-zinc-700/80"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 gsap-input relative z-50">
                                <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Location *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        autoComplete="off"
                                        value={formData.location}
                                        onChange={handleLocationChange}
                                        onFocus={() => {
                                            if (suggestions.length > 0) setShowSuggestions(true);
                                        }}
                                        onBlur={() => {
                                            // Delay hiding suggestions to allow clicking them
                                            setTimeout(() => setShowSuggestions(false), 200);
                                        }}
                                        className="pl-10 pr-12 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-white dark:hover:bg-zinc-700/80"
                                        placeholder="123 Main St, Near Central Park"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleLocateMe}
                                        disabled={isLocating}
                                        className="absolute inset-y-0 right-2 flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
                                        title="Locate Me"
                                    >
                                        {isLocating ? <Loader2 size={18} className="animate-spin text-indigo-500" /> : <Crosshair size={18} />}
                                    </button>
                                </div>

                                {/* Autocomplete Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-700 max-h-60 overflow-y-auto">
                                        {suggestions.map((suggestion, index) => (
                                            <div
                                                key={suggestion.place_id || index}
                                                className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-700 border-b border-slate-50 dark:border-zinc-700/50 last:border-0 transition-colors flex items-start gap-3"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                <MapPin size={16} className="text-slate-400 dark:text-zinc-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-slate-700 dark:text-zinc-300 line-clamp-2">
                                                    {suggestion.display_name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1 gsap-input">
                                <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Description *</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none text-slate-400 dark:text-zinc-500">
                                        <AlignLeft size={18} />
                                    </div>
                                    <textarea
                                        name="description"
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="pl-10 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-white dark:hover:bg-zinc-700/80 resize-none"
                                        placeholder="Describe the issue in detail..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 gsap-input">
                                <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Photo Evidence *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />

                                {imagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 group">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-red-500 transition-colors"
                                            title="Remove image"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group"
                                    >
                                        <Upload className="w-6 h-6 text-slate-400 dark:text-zinc-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                                        <span className="text-sm font-medium text-slate-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Click to upload a photo</span>
                                        <span className="text-xs text-slate-400 dark:text-zinc-500">JPG, PNG, WEBP</span>
                                    </button>
                                )}
                            </div>

                            <div className="pt-4 gsap-input">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-8 py-4 border border-transparent text-lg font-medium rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <Camera size={20} />
                                            Submit Complaint
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </PageWrapper>
    );
};

export default Report;
