import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './ReconciliationPage.css';

const ReconciliationPage = () => {
  const reconTypes = [
    { name: 'Pinelabs', bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
    { name: 'Razorpay', bg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' },
    { name: 'Worldline', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { name: 'Manual Upload', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-body animated">
          <div className="reconciliation-header-section">
            <div className="text-section">
              <h2>Data Reconciliation</h2>
              <p>Match your digital records with bank settlement statements.</p>
            </div>
          </div>

          <div className="recon-grid">
            {reconTypes.map((type) => (
              <div key={type.name} className="recon-card card">
                <div className="recon-icon-banner">
                    <div className="recon-banner-icon">📂</div>
                </div>
                <div className="recon-content">
                    <h3>{type.name} Settlement</h3>
                    <p>Process your weekly settlements for {type.name} exports.</p>
                    <div className="upload-zone">
                        <span className="upload-icon">☁️</span>
                        <p>Drag file or <span>select export</span></p>
                    </div>
                </div>
              </div>
            ))}
          </div>

          <div className="recon-history-card card">
            <div className="card-header-v2">
              <h3 className="section-title">Recent Recon Logs</h3>
            </div>
            <div className="empty-state-v2">
                <span>🕝</span>
                <p>No reconciliation runs found for this period.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReconciliationPage;
