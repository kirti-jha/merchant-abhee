import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored session on load
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('authUser');
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Simulation of database validation
        // In reality, this would be an API call
        if (!email || !password) return { success: false, message: 'Please enter both email and password.' };

        // Hardcoded testing credentials
        if (email === 'admin@telering.com' && password === 'admin123') {
            const adminUser = { id: 'a1', role: 'admin', name: 'Abhipay Admin', email };
            setUser(adminUser);
            localStorage.setItem('authUser', JSON.stringify(adminUser));
            return { success: true, role: 'admin' };
        } else if (email === 'merchant@telering.com' && password === 'merchant123') {
            const merchantUser = { id: 'm1', role: 'merchant', name: 'Kirti Jha', email, partnerId: '#9988222' };
            setUser(merchantUser);
            localStorage.setItem('authUser', JSON.stringify(merchantUser));
            return { success: true, role: 'merchant' };
        }

        return { success: false, message: 'Invalid credentials. Please try again.' };
    };

    const loginAsMerchant = (merchant) => {
        // Direct jump from Admin to Merchant
        const merchantUser = { 
            id: merchant.id, 
            role: 'merchant', 
            name: merchant.name, 
            email: merchant.email, 
            partnerId: merchant.mid || 'N/A' 
        };
        setUser(merchantUser);
        localStorage.setItem('authUser', JSON.stringify(merchantUser));
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('authUser');
    };

    return (
        <AuthContext.Provider value={{ user, login, loginAsMerchant, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
