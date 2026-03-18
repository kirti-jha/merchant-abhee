import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './AdminSettingsPage.css';

const AdminSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('teleringAdminSettings');
        return saved ? JSON.parse(saved) : {
            appName: 'My Application',
            language: 'English',
            timezone: 'IST (India Standard Time)',
            notifications: { txnAlerts: true, securityAlerts: true, monthlyReports: false }
        };
    });

    const handleSave = () => {
        localStorage.setItem('teleringAdminSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    };

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'security', label: 'Security', icon: '🛡️' },
        { id: 'appearance', label: 'Appearance', icon: '🎨' },
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
                          onChange={e => setSettings({...settings, appName: e.target.value})} 
                        />
                      </div>
                      <div className="form-group-v2">
                        <label>Default Language</label>
                        <select 
                          className="premium-select"
                          value={settings.language} 
                          onChange={e => setSettings({...settings, language: e.target.value})}
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
                          onChange={e => setSettings({...settings, timezone: e.target.value})}
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
                        { key: 'monthlyReports', label: 'Monthly Performance Reports', desc: 'Summary of volume, commission and growth.' }
                      ].map(item => (
                        <div className="option-item" key={item.key}>
                          <div className="option-info">
                            <div className="option-label">{item.label}</div>
                            <div className="option-desc">{item.desc}</div>
                          </div>
                          <label className="premium-switch">
                            <input 
                              type="checkbox" 
                              checked={settings.notifications[item.key]} 
                              onChange={e => setSettings({...settings, notifications: {...settings.notifications, [item.key]: e.target.checked}})} 
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

              {!['general', 'notifications', 'security'].includes(activeTab) && (
                <div className="portal-card card animated-fade-in">
                  <div className="empty-portal">
                    <h3>Coming Soon</h3>
                    <p>The {activeTab} settings module is currently under development.</p>
                  </div>
                </div>
              )}

              <div className="portal-actions">
                <button className="settings-cancel-btn">Reset to Default</button>
                <button className="settings-save-btn" onClick={handleSave}>Apply Settings</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
