import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import QrCodesPage from './pages/QrCodesPage';
import WalletPage from './pages/WalletPage';
import ApiServicesPage from './pages/ApiServicesPage';
import AdminDashboard from './pages/AdminDashboard';
import MerchantsPage from './pages/MerchantsPage';
import './index.css';

import ReconciliationPage from './pages/ReconciliationPage';
import QrCodesAdminPage from './pages/QrCodesAdminPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <Router>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          
          {/* Merchant Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="merchant"><DashboardPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute requiredRole="merchant"><TransactionsPage /></ProtectedRoute>} />
          <Route path="/qr-codes" element={<ProtectedRoute requiredRole="merchant"><QrCodesPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute requiredRole="merchant"><WalletPage /></ProtectedRoute>} />
          <Route path="/api-services" element={<ProtectedRoute requiredRole="merchant"><ApiServicesPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requiredRole="merchant"><DashboardPage /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/transactions" element={<ProtectedRoute requiredRole="admin"><TransactionsPage /></ProtectedRoute>} />
          <Route path="/admin/merchants" element={<ProtectedRoute requiredRole="admin"><MerchantsPage /></ProtectedRoute>} />
          <Route path="/admin/wallet" element={<ProtectedRoute requiredRole="admin"><WalletPage /></ProtectedRoute>} />
          <Route path="/admin/reconciliation" element={<ProtectedRoute requiredRole="admin"><ReconciliationPage /></ProtectedRoute>} />
          <Route path="/admin/qr-codes" element={<ProtectedRoute requiredRole="admin"><QrCodesAdminPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettingsPage /></ProtectedRoute>} />
          
          {/* Redirects */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        </Router>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
