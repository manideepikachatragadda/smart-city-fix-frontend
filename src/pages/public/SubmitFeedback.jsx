import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { submitFeedback } from '../../services/api';

const Feedback = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please provide a rating from 1 to 5 stars.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await submitFeedback(id, { rating, comments });
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-12 dark:bg-zinc-950">
                <div className="w-full max-w-lg bg-[#c7d2fe] dark:bg-zinc-900 p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-zinc-900/50 border border-slate-100 dark:border-zinc-800 relative overflow-hidden text-center z-10">

                    {/* Decorative shapes */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 dark:bg-yellow-900/20 rounded-bl-full -z-10 opacity-50"></div>

                    {!success ? (
                        <>
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Rate Your Experience</h2>
                                <p className="text-slate-500 dark:text-zinc-400 mt-2">Thank you for helping us improve! How satisfied are you with the resolution of issue #{id}?</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">

                                {/* 5-Star UI */}
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-90"
                                        >
                                            <Star
                                                size={48}
                                                className={`transition-colors duration-200 ${star <= (hoverRating || rating)
                                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                                                    : 'text-slate-200'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                                    {rating === 0 && 'Select a star rating'}
                                    {rating === 1 && '1 - Very Dissatisfied'}
                                    {rating === 2 && '2 - Dissatisfied'}
                                    {rating === 3 && '3 - Neutral'}
                                    {rating === 4 && '4 - Satisfied'}
                                    {rating === 5 && '5 - Very Satisfied'}
                                </div>

                                <div className="space-y-2 text-left relative">
                                    <div className="absolute top-3 left-3 text-slate-400 dark:text-zinc-500 pointer-events-none">
                                        <MessageSquare size={18} />
                                    </div>
                                    <textarea
                                        rows={4}
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        className="pl-10 w-full rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-white dark:hover:bg-zinc-700/80 resize-none"
                                        placeholder="Tell us more about your experience (optional)..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-8 py-4 border border-transparent text-lg font-medium rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        'Submit Feedback'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="py-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-green-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-6 shadow-inner dark:shadow-emerald-900/20 animate-bounce-short">
                                <CheckCircle className="w-10 h-10 text-green-500 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Thank You!</h2>
                            <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
                                Thank you for your feedback! It helps us continuously improve our city services.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </PageWrapper>
    );
};

export default Feedback;
