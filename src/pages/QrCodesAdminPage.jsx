import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ManualQrModal from '../components/ManualQrModal';
import { useAppContext } from '../context/AppContext';
import './QrCodesAdminPage.css';

const QrCodesAdminPage = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manage'
  const [uploadMode, setUploadMode] = useState('single');
  const [expandedSection, setExpandedSection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignFilter, setAssignFilter] = useState('All');

  const { qrCodes } = useAppContext();

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-body animated">
          <div className="qr-admin-header-flex">
            <div className="qr-title-group">
              <div className="qr-header-icon">⊞</div>
              <div className="qr-text-group">
                <h2>QR Management</h2>
                <p>Onboard physical QR codes and link them to merchant MIDs.</p>
              </div>
            </div>
            <button className="manual-create-top-btn" onClick={() => setIsModalOpen(true)}>
              + Manual Onboarding
            </button>
          </div>

          <div className="qr-nav-tabs">
            <button 
              className={`qr-nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <span className="tab-icon">📤</span> Bulk Upload
            </button>
            <button 
              className={`qr-nav-tab ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <span className="tab-icon">📋</span> Inventory
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div className="qr-admin-grid">
              <div className="qr-upload-card card">
                <div className="card-header-v2">
                   <div className="header-info">
                      <span className="upload-icon-small">🖼️</span>
                      <div>
                        <h4>Upload QR Code Image</h4>
                        <p>Import single or bulk QR files</p>
                      </div>
                   </div>
                   <div className="toggle-group-v2">
                      <button className={`toggle-opt ${uploadMode === 'single' ? 'active' : ''}`} onClick={() => setUploadMode('single')}>Single</button>
                      <button className={`toggle-opt ${uploadMode === 'bulk' ? 'active' : ''}`} onClick={() => setUploadMode('bulk')}>Bulk</button>
                   </div>
                </div>

                <div className="qr-dropzone-v2">
                  <div className="dropzone-content">
                    <span className="drop-img-icon">{uploadMode === 'single' ? '🖼️' : '📚'}</span>
                    <p>{uploadMode === 'single' ? 'Select QR image file (PNG/JPG)' : 'Select multiple QR image files or a ZIP'}</p>
                    <span className="drop-sub">{uploadMode === 'single' ? 'Maximum file size: 5MB' : 'Unlimited files in bulk mode'}</span>
                  </div>
                </div>

                <div className="qr-form-v2">
                  {uploadMode === 'single' ? (
                    <>
                      <div className="form-group-v2">
                        <label>Label / Name</label>
                        <input type="text" placeholder="e.g. Counter 1" />
                      </div>
                      <div className="form-group-v2">
                        <label>Terminal / MID</label>
                        <input type="text" placeholder="Enter assigned MID" />
                      </div>
                      
                      <div className={`collapsible-item ${expandedSection === 'advance' ? 'open' : ''}`}>
                        <div className="collapsible-header" onClick={() => toggleSection('advance')}>
                          <div className="header-left">
                            <span className="item-icon">🏦</span>
                            <span>Bank & Mapping Details</span>
                          </div>
                          <span className="chevron">▼</span>
                        </div>
                        <div className="collapsible-body">
                          <input type="text" placeholder="Bank Name" className="inner-input" />
                          <input type="text" placeholder="Account Number" className="inner-input" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bulk-info-box card">
                       <strong>Bulk Mode Active:</strong> 
                       <p>System will automatically extract UPI data and MIDs from filenames or QR metadata.</p>
                       <ul>
                          <li>Ensure filenames are like: <code>terminal_id.png</code></li>
                          <li>Accepted formats: PNG, JPG, WEBP</li>
                       </ul>
                    </div>
                  )}

                  <button className="upload-submit-btn-v2">
                     {uploadMode === 'single' ? 'Upload & Process QR' : 'Start Bulk Import'}
                  </button>
                </div>
              </div>

              <div className="qr-sidebar-v2">
                <div className="purple-card card">
                  <div className="manual-icon-v2">✨</div>
                  <h4>Manual Onboarding</h4>
                  <p>Input the UPI string manually to generate a secure code instantly.</p>
                  <button className="manual-generate-btn" onClick={() => setIsModalOpen(true)}>
                    Generate Now
                  </button>
                </div>
                
                <div className="how-it-works-card card">
                    <h4>How it works</h4>
                    <ul className="works-list">
                        <li>
                            <span className="step-num">1</span>
                            <p>Upload a QR image or enter UPI string manually.</p>
                        </li>
                        <li>
                            <span className="step-num">2</span>
                            <p>Map the QR to a specific Merchant or Terminal ID.</p>
                        </li>
                        <li>
                            <span className="step-num">3</span>
                            <p>QR code becomes immediately active for payments.</p>
                        </li>
                    </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="qr-manage-container card animated-fade-in">
              <div className="manage-toolbar">
                <div className="manage-left">
                    <div className="manage-search">
                        <span className="search-icon">🔍</span>
                        <input type="text" placeholder="Search by MID or UPI handle..." />
                    </div>
                </div>
                <div className="manage-right">
                  <div className="filter-group-managed">
                     {['All', 'Active', 'Disabled'].map(opt => (
                        <button key={opt} className={`filter-btn-v2 ${statusFilter === opt ? 'active' : ''}`} onClick={() => setStatusFilter(opt)}>{opt}</button>
                     ))}
                  </div>
                  <div className="filter-group-managed">
                     {['All', 'Assigned', 'Unassigned'].map(opt => (
                        <button key={opt} className={`filter-btn-v2 ${assignFilter === opt ? 'active' : ''}`} onClick={() => setAssignFilter(opt)}>{opt}</button>
                     ))}
                  </div>
                  <button className="refresh-btn-v2" onClick={() => window.location.reload()}>Refresh</button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="manage-qrs-table">
                  <thead>
                    <tr>
                      <th>UPI Handle</th>
                      <th>Assigned Merchant</th>
                      <th>Label & MID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrCodes.filter(q => {
                      if (statusFilter !== 'All' && q.status !== statusFilter) return false;
                      if (assignFilter === 'Assigned' && q.merchantName === 'Unassigned') return false;
                      if (assignFilter === 'Unassigned' && q.merchantName !== 'Unassigned') return false;
                      return true;
                    }).map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="qr-upi-cell">
                             <div className="qr-thumb-small">▦</div>
                             <span className="upi-text">{item.upiId}</span>
                          </div>
                        </td>
                        <td>
                          {item.merchantName !== 'Unassigned' ? (
                            <div className="assigned-merchant">
                              <div className="m-name">{item.merchantName}</div>
                              <div className="m-id">ID: {item.mid || '102293'}</div>
                            </div>
                          ) : (
                            <span className="unassigned-badge">In Inventory</span>
                          )}
                        </td>
                        <td>
                          <div className="mid-label-cell">
                             <div className="label-text">{item.label}</div>
                             <div className="mid-text">{item.mid}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge-v2 ${item.status.toLowerCase()}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="table-footer-v2">
                <span className="showing-text">Inventory: {qrCodes.length} QR Codes registered</span>
                <div className="pagination-v2">
                   <button className="nav-btn-v2">Previous</button>
                   <button className="nav-num-v2 active">1</button>
                   <button className="nav-btn-v2">Next</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <ManualQrModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default QrCodesAdminPage;
