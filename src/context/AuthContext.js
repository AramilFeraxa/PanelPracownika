import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));

    const INACTIVITY_LIMIT = 30 * 60 * 1000;
    let inactivityTimer = null;

    const logout = useCallback(() => {
        setToken(null);
        localStorage.removeItem('token');
        window.location.href = '/';
    }, []);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        inactivityTimer = setTimeout(() => {
            alert('Zostałeś automatycznie wylogowany z powodu braku aktywności.');
            logout();
        }, INACTIVITY_LIMIT);
    }, [logout]);

    useEffect(() => {
        if (!token) return;

        const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));
        resetInactivityTimer();

        return () => {
            activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
            if (inactivityTimer) clearTimeout(inactivityTimer);
        };
    }, [token, resetInactivityTimer]);

    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
