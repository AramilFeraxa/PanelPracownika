import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    const INACTIVITY_LIMIT = 30 * 60 * 1000;
    let inactivityTimer = null;

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

    useEffect(() => {
        const validateToken = async () => {
            if (!token) return;

            try {
                const res = await fetch('https://panel-pracownika-api.onrender.com/api/User/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Token invalid');
            } catch (err) {
                logout();
            }
        };

        validateToken();
    }, [token]);

    const login = ({ token: newToken, user: userInfo }) => {
        setToken(newToken);
        setUser(userInfo);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
