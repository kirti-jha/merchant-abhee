import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { API_BASE } from '../config/api';
import './AdminSettingsPage.css';

const createDefaultLocalSettings = () => ({
  appName: 'My Application',
  language: 'English (US)',
  timezone: 'IST (India Standard Time) - GMT+5:30',
  notifications: {
    txnAlerts: true,
    securityAlerts: true,
    monthlyReports: false,
  },
});

const createDefaultPayoutDraft = () => ({
  type: 'flat',
  ranges: [{ min: '0', max: '1000', value: '10' }],
  default: '20',
});

const toPayoutDraft = (rawConfig) => {
  try {
    const parsed = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
    if (!parsed || typeof parsed !== 'object') return createDefaultPayoutDraft();

    return {
      type: parsed.type === 'percentage' ? 'percentage' : 'flat',
      ranges: Array.isArray(parsed.ranges) && parsed.ranges.length > 0
        ? parsed.ranges.map((range) => ({
            min: String(range?.min ?? ''),
            max: String(range?.max ?? ''),
            value: String(range?.value ?? ''),
          }))
        : createDefaultPayoutDraft().ranges,
      default: String(parsed.default ?? '20'),
    };
  } catch (_error) {
    return createDefaultPayoutDraft();
  }
};

const normalizePayoutConfig = (draft) => {
  if (!draft.ranges.length) {
    throw new Error('Add at least one payout charge range.');
  }

  const ranges = draft.ranges.map((range, index) => {
    const min = Number(range.min);
    const max = Number(range.max);
    const value = Number(range.value);

    if ([min, max, value].some(Number.isNaN)) {
      throw new Error(`Range ${index + 1} contains an invalid number.`);
    }

    if (max < min) {
      throw new Error(`Range ${index + 1} max value must be greater than or equal to min.`);
    }

    return { min, max, value };
  });

  const defaultValue = Number(draft.default);
  if (Number.isNaN(defaultValue)) {
    throw new Error('Default fee must be a valid number.');
  }

  return {
    type: draft.type === 'percentage' ? 'percentage' : 'flat',
    ranges,
    default: defaultValue,
  };
};

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('payouts');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [payoutConfigDraft, setPayoutConfigDraft] = useState(createDefaultPayoutDraft);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('teleringAdminSettings');
    if (!saved) return createDefaultLocalSettings();

    try {
      return { ...createDefaultLocalSettings(), ...JSON.parse(saved) };
    } catch (_error) {
      return createDefaultLocalSettings();
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const authToken = sessionStorage.getItem('authToken');
      try {
        const res = await fetch(`${API_BASE}/settings`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setPayoutConfigDraft(toPayoutDraft(data.payout_config));
      } catch (err) {
        console.error('Failed to load DB settings', err);
      }
    };

    fetchSettings();
  }, []);

  const updateRangeField = (index, field, value) => {
    setPayoutConfigDraft((current) => ({
      ...current,
      ranges: current.ranges.map((range, rangeIndex) => (
        rangeIndex === index ? { ...range, [field]: value } : range
      )),
    }));
  };

  const addRange = () => {
    setPayoutConfigDraft((current) => ({
      ...current,
      ranges: [...current.ranges, { min: '', max: '', value: '' }],
    }));
  };

  const removeRange = (index) => {
    setPayoutConfigDraft((current) => ({
      ...current,
      ranges: current.ranges.length === 1
        ? [{ min: '', max: '', value: '' }]
        : current.ranges.filter((_, rangeIndex) => rangeIndex !== index),
    }));
  };

  const handleReset = () => {
    if (activeTab === 'payouts') {
      setPayoutConfigDraft(createDefaultPayoutDraft());
      setStatusMessage({ type: '', text: '' });
      return;
    }

    setSettings(createDefaultLocalSettings());
    setStatusMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    localStorage.setItem('teleringAdminSettings', JSON.stringify(settings));

    const authToken = sessionStorage.getItem('authToken');
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const normalizedPayoutConfig = normalizePayoutConfig(payoutConfigDraft);
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          payout_config: JSON.stringify(normalizedPayoutConfig),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save payout settings.');
      }

      setPayoutConfigDraft(toPayoutDraft(normalizedPayoutConfig));
      setStatusMessage({ type: 'success', text: 'Payout settings saved successfully.' });
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error saving settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'payouts', label: 'Payout Charges', icon: '💸' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🛡️' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-body animated">
          <div className="settings-header">
            <div className="text-section">
              <h2>System Settings</h2>
              <p>Configure platform preferences, security, and integration hooks.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-nav-sidebar">
              <div className="settings-nav-card card">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`setting-tab-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                    {activeTab === tab.id && <span className="active-indicator"></span>}
                  </button>
                ))}
              </div>

              <div className="settings-info-box">
                <h4>Need Help?</h4>
                <p>Read our documentation for advanced configuration guides.</p>
                <button className="docs-link-btn">View Documentation</button>
              </div>
            </div>

            <div className="settings-main-portal">
              {activeTab === 'general' && (
                <div className="portal-card card animated-fade-in">
                  <div className="portal-header">
                    <h3>General Preferences</h3>
                    <p>Core application identity and localization.</p>
                  </div>
                  <div className="portal-content">
                    <div className="form-grid-v2">
                      <div className="form-group-v2">
                        <label>Platform Name</label>
                        <input
                          type="text"
                          className="premium-input"
                          value={settings.appName}
                          onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                        />
                      </div>
                      <div className="form-group-v2">
                        <label>Default Language</label>
                        <select
                          className="premium-select"
                          value={settings.language}
                          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        >
                          <option>English (US)</option>
                          <option>Hindi (India)</option>
                          <option>Spanish</option>
                        </select>
                      </div>
                      <div className="form-group-v2 full-width">
                        <label>System Timezone</label>
                        <select
                          className="premium-select"
                          value={settings.timezone}
                          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                        >
                          <option>IST (India Standard Time) - GMT+5:30</option>
                          <option>UTC (Coordinated Universal Time)</option>
                          <option>PST (Pacific Standard Time)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="portal-card card animated-fade-in">
                  <div className="portal-header">
                    <h3>Notification Channels</h3>
                    <p>Control how and when you receive system alerts.</p>
                  </div>
                  <div className="portal-content">
                    <div className="option-list">
                      {[
                        { key: 'txnAlerts', label: 'Transaction Success Alerts', desc: 'Receive instant alerts for every processed payment.' },
                        { key: 'securityAlerts', label: 'Security & Login Alerts', desc: 'Get notified of new logins or suspicious activities.' },
                        { key: 'monthlyReports', label: 'Monthly Performance Reports', desc: 'Summary of volume, commission and growth.' },
                      ].map((item) => (
                        <div className="option-item" key={item.key}>
                          <div className="option-info">
                            <div className="option-label">{item.label}</div>
                            <div className="option-desc">{item.desc}</div>
                          </div>
                          <label className="premium-switch">
                            <input
                              type="checkbox"
                              checked={settings.notifications[item.key]}
                              onChange={(e) => setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  [item.key]: e.target.checked,
                                },
                              })}
                            />
                            <span className="switch-slider"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="portal-card card animated-fade-in">
                  <div className="portal-header">
                    <h3>Account Security</h3>
                    <p>Protect your credentials and enable advanced guards.</p>
                  </div>
                  <div className="portal-content">
                    <div className="security-section">
                      <div className="form-group-v2">
                        <label>Current Password</label>
                        <input type="password" placeholder="••••••••" className="premium-input" />
                      </div>
                      <div className="form-row-grid">
                        <div className="form-group-v2">
                          <label>New Password</label>
                          <input type="password" placeholder="Min 8 characters" className="premium-input" />
                        </div>
                        <div className="form-group-v2">
                          <label>Confirm Password</label>
                          <input type="password" placeholder="Repeat new password" className="premium-input" />
                        </div>
                      </div>
                      <button className="action-link-btn">Update Password</button>
                    </div>

                    <div className="portal-divider"></div>

                    <div className="option-item">
                      <div className="option-info">
                        <div className="option-label">Two-Factor Authentication</div>
                        <div className="option-desc">Add an extra layer of security via mobile OTP.</div>
                      </div>
                      <label className="premium-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="switch-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payouts' && (
                <div className="portal-card card animated-fade-in">
                  <div className="portal-header">
                    <h3>Merchant Payout Rules</h3>
                    <p>Configure how much merchants are charged for bank withdrawals based on the amount range.</p>
                  </div>
                  <div className="portal-content">
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Global Charge Mode</label>
                      <select
                        className="premium-select"
                        value={payoutConfigDraft.type}
                        onChange={(e) => setPayoutConfigDraft((current) => ({ ...current, type: e.target.value }))}
                      >
                        <option value="flat">Flat Fee (₹)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>

                    <div className="range-list">
                      <label style={{ display: 'block', marginBottom: '16px', fontWeight: 600 }}>Charge Ranges</label>
                      {payoutConfigDraft.ranges.map((range, index) => (
                        <div key={index} className="settings-range-row">
                          <input
                            type="number"
                            className="premium-input"
                            placeholder="Min (₹)"
                            value={range.min}
                            onChange={(e) => updateRangeField(index, 'min', e.target.value)}
                          />
                          <input
                            type="number"
                            className="premium-input"
                            placeholder="Max (₹)"
                            value={range.max}
                            onChange={(e) => updateRangeField(index, 'max', e.target.value)}
                          />
                          <input
                            type="number"
                            className="premium-input"
                            placeholder={payoutConfigDraft.type === 'flat' ? 'Fee (₹)' : 'Fee (%)'}
                            value={range.value}
                            onChange={(e) => updateRangeField(index, 'value', e.target.value)}
                          />
                          <button
                            type="button"
                            className="settings-range-remove"
                            onClick={() => removeRange(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button type="button" className="add-range-btn" onClick={addRange}>
                        + Add New Range
                      </button>
                    </div>

                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Default Fee (if no range matches)</label>
                      <input
                        type="number"
                        className="premium-input settings-default-fee"
                        value={payoutConfigDraft.default}
                        onChange={(e) => setPayoutConfigDraft((current) => ({ ...current, default: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {!['notifications', 'security', 'payouts'].includes(activeTab) && (
                <div className="portal-card card animated-fade-in">
                  <div className="empty-portal">
                    <h3>Coming Soon</h3>
                    <p>The {activeTab} settings module is currently under development.</p>
                  </div>
                </div>
              )}

              {statusMessage.text && (
                <div className={`settings-status-banner ${statusMessage.type}`}>
                  {statusMessage.text}
                </div>
              )}

              <div className="portal-actions">
                <button className="settings-cancel-btn" onClick={handleReset}>Reset to Default</button>
                <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Apply Settings'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
