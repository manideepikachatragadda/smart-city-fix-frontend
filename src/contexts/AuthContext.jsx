import React, { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const getInitialState = () => {
        const token = localStorage.getItem('access_token');
        try {
            const parsed = token ? jwtDecode(token) : null;
            return {
                token: token || null,
                isAuthenticated: !!token,
                role: parsed ? parsed.role : null,
                department: parsed ? parsed.department : null,
            };
        } catch {
            return { token: null, isAuthenticated: false, role: null, department: null };
        }
    };

    const [authState, setAuthState] = useState(getInitialState);

    const login = (token) => {
        localStorage.setItem('access_token', token);
        const parsed = jwtDecode(token);
        setAuthState({
            token,
            isAuthenticated: true,
            role: parsed ? parsed.role : null,
            department: parsed ? parsed.department : null,
        });
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setAuthState({ token: null, isAuthenticated: false, role: null, department: null });
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Export useAuthStore to maintain backwards compatibility
const useAuthStore = () => {
    return useContext(AuthContext);
};

export default useAuthStore;
