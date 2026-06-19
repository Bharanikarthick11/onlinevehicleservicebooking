import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null); // 'user' or 'admin'
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial load: check if there's a token in local storage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('userRole');

        if (storedToken && storedRole) {
            setIsAuthenticated(true);
            setToken(storedToken);
            setUserRole(storedRole);
        }

        setLoading(false);
    }, []);

    const login = (role, jwtToken = 'mock-jwt-token-123') => {
        // Placeholders for real JWT decoding
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('userRole', role);

        setIsAuthenticated(true);
        setToken(jwtToken);
        setUserRole(role);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');

        setIsAuthenticated(false);
        setToken(null);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
