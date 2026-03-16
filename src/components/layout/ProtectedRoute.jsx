import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, role } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
