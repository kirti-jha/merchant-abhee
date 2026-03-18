import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAppContext } from '../context/AppContext';
import './TransactionsPage.css';

const TransactionsPage = () => {
  const { transactions } = useAppContext();
  const [filter, setFilter] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleExport = () => {
    alert('Exporting transactions as CSV...');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-body animated">
          <div className="transactions-page-header">
            <div className="transactions-title text-section">
              <h2>Transactions Explorer</h2>
              <p>Search and manage all platform transactions.</p>
            </div>
            
            <div className="transactions-header-actions">
              <input 
                type="text" 
                className="txn-filter-input" 
                placeholder="Search by RRN, ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="export-btn" onClick={handleExport}>
                <span>📥</span> Export CSV
              </button>
            </div>
          </div>

          <div className="txn-table-card">
            <div className="txn-toolbar">
              <div className="txn-search-wrap">
                <span className="txn-search-icon">🔍</span>
                <input 
                  type="text" 
                  className="txn-search-input" 
                  placeholder="Quick search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="txn-filters">
                {['All', 'Credit', 'Debit', 'Pending'].map(f => (
                  <button 
                    key={f} 
                    className={`txn-pill-filter ${f === filter ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Ref No (RRN)</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                   {transactions.filter(tx => {
                    const matchesFilter = filter === 'All' || tx.type.toLowerCase() === filter.toLowerCase() || tx.status.toLowerCase() === filter.toLowerCase();
                    const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        tx.description.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesFilter && matchesSearch;
                  }).map((tx) => (
                    <tr key={tx.id}>
                      <td className="txn-id-cell">{tx.id}</td>
                      <td className="date-cell">{new Date(tx.date).toLocaleString()}</td>
                      <td style={{textTransform: 'uppercase', fontWeight: '600', fontSize: '12px'}}>{tx.type}</td>
                      <td className={`txn-amount-cell ${tx.type === 'credit' ? 'txn-amount-credit' : 'txn-amount-debit'}`}>
                        {tx.type === 'debit' ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td>{tx.description}</td>
                      <td><span className={`status-pill ${tx.status.toLowerCase()}`}>{tx.status}</span></td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-mute)'}}>No transaction records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="txn-table-footer">
              <span className="txn-count-text">Showing {transactions.length} total entries</span>
              <div className="pagination-v2">
                <button className="nav-btn-v2">Previous</button>
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

export default TransactionsPage;
