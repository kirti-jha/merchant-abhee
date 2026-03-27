import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import './MerchantsPage.css';

const DEFAULT_CALLBACK_URL = 'https://your-server.com/payment/webhook';

const createEmptyForm = () => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  businessName: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  panNumber: '',
  aadhaarNumber: '',
  callbackUrl: DEFAULT_CALLBACK_URL,
});

const splitFullName = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
};

const MerchantsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [submitting, setSubmitting] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState(null);
  const [formData, setFormData] = useState(createEmptyForm);

  const { merchants, addMerchant, updateMerchant, updateMerchantStatus, deleteMerchant } = useAppContext();
  const { getImpersonateToken } = useAuth();

  const isEditMode = Boolean(editingMerchant);

  const resetForm = () => {
    setFormData(createEmptyForm());
    setEditingMerchant(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitting(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (merchant) => {
    const { firstName, lastName } = splitFullName(merchant.fullName);
    setEditingMerchant(merchant);
    setFormData({
      ...createEmptyForm(),
      firstName,
      lastName,
      email: merchant.email || '',
      phone: merchant.phone || '',
      businessName: merchant.businessName || '',
      address: merchant.address || '',
      city: merchant.city || '',
      state: merchant.state || '',
      pincode: merchant.pincode || '',
      panNumber: merchant.panNumber || '',
      aadhaarNumber: merchant.aadhaarNumber || '',
      callbackUrl: merchant.callbackUrl || DEFAULT_CALLBACK_URL,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleLoginAs = async (merchant) => {
    const result = await getImpersonateToken(merchant.id);
    if (result.success) {
      window.open(`${window.location.origin}/?token=${result.token}`, '_blank');
    } else {
      alert(result.message || 'Failed to login as merchant');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const action = isEditMode
      ? updateMerchant(editingMerchant.id, formData)
      : addMerchant(formData);

    const result = await action;

    if (result?.success) {
      closeModal();
      return;
    }

    setSubmitting(false);
    alert(result?.error || `Failed to ${isEditMode ? 'update' : 'create'} merchant`);
  };

  const filteredMerchants = merchants.filter((merchant) => {
    const normalizedStatus = (merchant.status || '').toLowerCase();
    if (activeTab !== 'All' && normalizedStatus !== activeTab.toLowerCase()) return false;

    if (!searchTerm) return true;

    const query = searchTerm.toLowerCase();
    return (
      merchant.fullName?.toLowerCase().includes(query) ||
      merchant.email?.toLowerCase().includes(query) ||
      merchant.mid?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-body animated">
          <div className="merchants-header">
            <div className="merchants-title">
              <h2>Merchants Fleet</h2>
              <p>Onboard and manage platform merchant sub-agents.</p>
            </div>
            <button className="add-merchant-btn" onClick={openCreateModal}>
              <span>+</span> New Merchant
            </button>
          </div>

          <div className="merchants-table-card">
            <div className="merchants-toolbar">
              <div className="merchant-search-wrap">
                <span className="merchant-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Filter merchants by MID, name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="txn-filters">
                {['All', 'Active', 'Inactive'].map((tab) => (
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
              <table className="merchants-table">
                <thead>
                  <tr>
                    <th>Merchant Identity</th>
                    <th>Merchant Code (MID)</th>
                    <th>Wallet Balance</th>
                    <th>Status</th>
                    <th>Commission</th>
                    <th>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMerchants.map((merchant) => (
                    <tr key={merchant.id}>
                      <td>
                        <div className="merchant-name-cell">
                          <div className="merchant-avatar">{merchant.fullName?.charAt(0) || '?'}</div>
                          <div className="merchant-name-info">
                            <div className="m-name">{merchant.fullName}</div>
                            <div className="m-email">{merchant.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="mid-badge">{merchant.mid || 'MID-102938'}</span></td>
                      <td className="volume-cell">₹ {merchant.walletBalance || '0.00'}</td>
                      <td><span className={`status-pill ${merchant.status?.toLowerCase() || 'active'}`}>{merchant.status}</span></td>
                      <td style={{ fontSize: '12px', fontWeight: '600' }}>1.2%</td>
                      <td>
                        <div className="merchant-actions">
                          <button className="action-btn" onClick={() => openEditModal(merchant)}>Edit</button>
                          <button className="action-btn login-btn" onClick={() => handleLoginAs(merchant)}>Login</button>
                          <button
                            className="action-btn"
                            onClick={() => updateMerchantStatus(merchant.id, merchant.status?.toLowerCase() === 'active' ? 'inactive' : 'active')}
                          >
                            Toggle
                          </button>
                          <button className="action-btn danger-btn" onClick={() => deleteMerchant(merchant.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="txn-table-footer">
              <span className="txn-count-text">Displaying {filteredMerchants.length} registered merchants</span>
              <div className="pagination-v2">
                <button className="nav-btn-v2">Prev</button>
                <button className="nav-num-v2 active">1</button>
                <button className="nav-btn-v2">Next</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header-gradient">
              <h3>{isEditMode ? 'Edit Merchant' : 'Add Merchant'}</h3>
              <button className="close-modal" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-grid">
                  <div className="form-group">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name *"
                      className="form-input-box"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      className="form-input-box"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email *"
                      className="form-input-box"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone"
                      className="form-input-box"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <div className="password-input-wrapper">
                      <input
                        type="password"
                        name="password"
                        placeholder={isEditMode ? 'New Password (leave blank to keep current)' : 'Password *'}
                        className="form-input-box"
                        required={!isEditMode}
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <span className="eye-icon">👁️</span>
                    </div>
                    {isEditMode && <p className="help-text">Leave password blank if you do not want to change it.</p>}
                  </div>
                  <div className="form-group full-width">
                    <input
                      type="text"
                      name="businessName"
                      placeholder="Business Name"
                      className="form-input-box"
                      value={formData.businessName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      className="form-input-box"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      className="form-input-box"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      className="form-input-box"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Pincode"
                      className="form-input-box"
                      value={formData.pincode}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="panNumber"
                      placeholder="PAN Number"
                      className="form-input-box"
                      value={formData.panNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <input
                      type="text"
                      name="aadhaarNumber"
                      placeholder="Aadhaar Number"
                      className="form-input-box"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label style={{ fontSize: '0.6875rem', fontWeight: '600', color: '#9CA3AF', marginBottom: '4px' }}>Callback URL</label>
                    <input
                      type="text"
                      name="callbackUrl"
                      value={formData.callbackUrl}
                      className="form-input-box"
                      onChange={handleChange}
                    />
                    <p className="help-text">POST endpoint for payment status notifications</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-create" disabled={submitting}>
                  {submitting ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Merchant')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantsPage;
