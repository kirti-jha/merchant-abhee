import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAppContext } from '../context/AppContext';
import './WalletPage.css';

const WalletPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const { wallet, transactions, requestFunds } = useAppContext();

  const handleRequestFunds = () => {
    const amount = prompt("Enter amount to request:");
    if (amount && !isNaN(amount)) {
      requestFunds(amount, "Manual Request");
      alert(`Requested ₹${amount} successfully!`);
    }
  };

  const filteredTransactions = transactions.filter(t => {
      if (activeTab === 'All') return true;
      return t.type.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-body animated">
          <div className="wallet-header-section">
            <div className="text-section">
              <h2>Wallet & Settlements</h2>
              <p>Manage your funds and request manual settlements.</p>
            </div>
          </div>

          <div className="wallet-balance-card">
            <div className="balance-info-wrapper">
              <div className="balance-label">CURRENT BALANCE</div>
              <div className="balance-value">₹ {wallet?.balance.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}</div>
              <div className="balance-stats-row">
                <div className="stat-badge">
                  <span className="stat-label">Currency:</span>
                  <span className="stat-value">{wallet?.currency || 'INR'}</span>
                </div>
                <div className="stat-badge">
                  <span className="stat-label">Status:</span>
                  <span className="stat-value" style={{color: 'var(--success)'}}>Active</span>
                </div>
              </div>
            </div>
            <button className="request-funds-btn" onClick={handleRequestFunds}>
              <span>+</span> Request Settlement
            </button>
          </div>

          <div className="wallet-history-section card">
            <div className="history-toolbar">
              <h3 className="history-title">Funds Movement History</h3>
              <div className="txn-filters">
                {['All', 'Debit', 'Credit'].map(tab => (
                  <button 
                    key={tab} 
                    className={`txn-pill-filter ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="wallet-table">
                <thead>
                  <tr>
                    <th>Entry Date</th>
                    <th>Record ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance Post Txn</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((item, idx) => (
                    <tr key={idx}>
                      <td className="date-cell">{new Date(item.date).toLocaleString()}</td>
                      <td className="ref-cell">{item.id.substring(0, 12)}...</td>
                      <td>
                        <span className={`status-pill ${item.type.toLowerCase()}`}>
                          {item.type.toUpperCase()}
                        </span>
                      </td>
                      <td className={`amount-cell ${item.type.toLowerCase()}`}>
                        {item.type === 'debit' ? '-' : '+'}₹{Math.abs(item.amount).toFixed(2)}
                      </td>
                      <td className="after-cell">₹ { (wallet?.balance + (idx * 50)).toFixed(2) }</td>
                      <td className="note-cell">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="txn-table-footer">
              <span className="txn-count-text">Showing {filteredTransactions.length} records</span>
              <div className="pagination-v2">
                <button className="nav-btn-v2">Prev</button>
                <button className="nav-num-v2 active">1</button>
                <button className="nav-btn-v2">Next</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WalletPage;
