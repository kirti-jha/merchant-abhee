import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const initialMockData = {
    wallet: {
        balance: 245000,
        currency: 'INR',
        lastUpdated: new Date().toISOString()
    },
    transactions: [
        { id: 'tx-001', date: new Date(Date.now() - 3600000).toISOString(), description: 'Fund Transfer to Merchant A', amount: -5000, status: 'Completed', type: 'debit' },
        { id: 'tx-002', date: new Date(Date.now() - 86400000).toISOString(), description: 'Wallet Top Up', amount: 50000, status: 'Completed', type: 'credit' },
        { id: 'tx-003', date: new Date(Date.now() - 172800000).toISOString(), description: 'Settlement from QR', amount: 12500, status: 'Completed', type: 'credit' },
        { id: 'tx-004', date: new Date(Date.now() - 259200000).toISOString(), description: 'Fund Transfer to Bank', amount: -10000, status: 'Pending', type: 'debit' }
    ],
    merchants: [
        { id: 'm-001', mid: 'MID-8822001', name: 'FreshMart Groceries', email: 'contact@freshmart.com', status: 'Active', joined: '2025-10-12', totalVolume: 45000 },
        { id: 'm-002', mid: 'MID-8822002', name: 'TechHaven Electronics', email: 'sales@techhaven.com', status: 'Active', joined: '2025-11-05', totalVolume: 125000 },
        { id: 'm-003', mid: 'MID-8822003', name: 'Coffee House Co.', email: 'hello@coffeehouse.com', status: 'Inactive', joined: '2026-01-20', totalVolume: 8500 }
    ],
    qrCodes: [
        { id: 'qr-001', label: 'Main Counter', status: 'Active', mid: 'MID-8822001', merchantName: 'FreshMart Groceries', type: 'Single', upiId: 'freshmart@ybl' },
        { id: 'qr-002', label: 'Drive Thru', status: 'Active', mid: 'MID-8822003', merchantName: 'Coffee House Co.', type: 'Single', upiId: 'coffeehouse@ybl' },
        { id: 'qr-003', label: 'Unassigned Display', status: 'Inactive', mid: 'Unassigned', merchantName: 'Unassigned', type: 'Bulk', upiId: 'Pending' }
    ]
};

export const AppProvider = ({ children }) => {
    const [appState, setAppState] = useState(() => {
        const storedState = localStorage.getItem('teleringAppState');
        return storedState ? JSON.parse(storedState) : initialMockData;
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('teleringTheme') || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('teleringAppState', JSON.stringify(appState));
    }, [appState]);

    useEffect(() => {
        localStorage.setItem('teleringTheme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Wallet Actions
    const addFunds = (amount) => {
        const newTransaction = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString(),
            description: 'Manual Wallet Top Up',
            amount: parseFloat(amount),
            status: 'Completed',
            type: 'credit'
        };
        setAppState(prev => ({
            ...prev,
            wallet: { ...prev.wallet, balance: prev.wallet.balance + parseFloat(amount) },
            transactions: [newTransaction, ...prev.transactions]
        }));
    };

    const requestFunds = (amount, reason) => {
         const newTransaction = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString(),
            description: `Fund Request: ${reason}`,
            amount: parseFloat(amount),
            status: 'Pending',
            type: 'credit'
        };
        setAppState(prev => ({
            ...prev,
            transactions: [newTransaction, ...prev.transactions]
        }));
    };

    // Merchant Actions
    const addMerchant = (merchant) => {
        setAppState(prev => ({
            ...prev,
            merchants: [{...merchant, id: `m-${Date.now()}`, joined: new Date().toISOString().split('T')[0], totalVolume: 0}, ...prev.merchants]
        }));
    };

    const updateMerchantStatus = (id, newStatus) => {
        setAppState(prev => ({
            ...prev,
            merchants: prev.merchants.map(m => m.id === id ? { ...m, status: newStatus } : m)
        }));
    };

    const deleteMerchant = (id) => {
        setAppState(prev => ({
            ...prev,
            merchants: prev.merchants.filter(m => m.id !== id)
        }));
    };

    // QR Code Actions
    const addQrCode = (qrData) => {
        setAppState(prev => ({
            ...prev,
            qrCodes: [{ ...qrData, id: `qr-${Date.now()}` }, ...prev.qrCodes]
        }));
    };
    
    // Generic
    const resetData = () => {
        setAppState(initialMockData);
        localStorage.setItem('teleringAppState', JSON.stringify(initialMockData));
    }

    return (
        <AppContext.Provider value={{
            ...appState,
            theme,
            toggleTheme,
            addFunds,
            requestFunds,
            addMerchant,
            updateMerchantStatus,
            deleteMerchant,
            addQrCode,
            resetData
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
