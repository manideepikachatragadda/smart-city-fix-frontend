import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getTeamMembers, assignWorker } from '../../services/api';

const AssignWorkerModal = ({ isOpen, onClose, complaintId, onAssignmentSuccess }) => {
    const [team, setTeam] = useState([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [isFetchingTeam, setIsFetchingTeam] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSelectedWorkerId('');
            setTeam([]);
            return;
        }

        const fetchTeam = async () => {
            try {
                setIsFetchingTeam(true);
                const data = await getTeamMembers();
                // Filter out inactive users just to be safe
                setTeam(data.filter(u => u.is_active));
            } catch (err) {
                console.error('Failed to fetch team data', err);
                toast.error('Failed to load team members.');
            } finally {
                setIsFetchingTeam(false);
            }
        };

        fetchTeam();
    }, [isOpen]);

    const handleAssign = async () => {
        if (!selectedWorkerId) return;

        try {
            setIsAssigning(true);
            await assignWorker(complaintId, selectedWorkerId);
            toast.success(`Task #${complaintId} successfully assigned.`);
            onAssignmentSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to assign worker', err);
            toast.error('Failed to assign the ticket.');
        } finally {
            setIsAssigning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            <div className="bg-[#c7d2fe] rounded-xl shadow-xl w-full max-w-md relative z-10 transform transition-all animate-in zoom-in-95 duration-200 px-6 py-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Assign Ticket #{complaintId}
                </h3>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Select a Worker
                    </label>

                    {isFetchingTeam ? (
                        <div className="flex items-center gap-3 text-slate-500 text-sm py-2">
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                            Loading team...
                        </div>
                    ) : team.length === 0 ? (
                        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                            You have no active team members to assign tasks to.
                        </p>
                    ) : (
                        <select
                            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none transition-colors"
                            value={selectedWorkerId}
                            onChange={(e) => setSelectedWorkerId(e.target.value)}
                            disabled={isAssigning}
                        >
                            <option value="" disabled>--- Select a Worker ---</option>
                            {team.map(worker => (
                                <option key={worker.id} value={worker.id}>
                                    {worker.first_name} {worker.last_name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isAssigning}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={isAssigning || !selectedWorkerId || isFetchingTeam || team.length === 0}
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isAssigning && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                        Confirm Assignment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignWorkerModal;
