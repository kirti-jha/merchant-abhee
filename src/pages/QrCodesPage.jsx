import React, { useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { QRCodeSVG } from 'qrcode.react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import './QrCodesPage.css';

const QrCodesPage = () => {
  const { qrCodes } = useAppContext();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('My QR');
  const [dynamicAmount, setDynamicAmount] = React.useState('');

  // Filter QRs assigned to this merchant
  const myQrs = useMemo(() => {
    return (qrCodes || []).filter(q => q.merchantId === user?.id && q.status === 'active');
  }, [qrCodes, user]);

  // Rotate: Pick one random QR from the assigned set
  const activeQr = useMemo(() => {
    if (myQrs.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * myQrs.length);
    return myQrs[randomIndex];
  }, [myQrs]);

  // Calculate UPI String based on tab
  const getUpiString = (amount = 0) => {
    if (!activeQr) return "upi://pay?pa=unassigned@upi&pn=Unassigned&mc=0000&tid=&tr=&tn=Unassigned&am=0&cu=INR";
    
    // tr is the transaction reference, used to track this specific QR instance
    return `upi://pay?pa=${activeQr.upiId}&pn=${encodeURIComponent(user?.name || 'Merchant')}&mc=0000&tid=${activeQr.tid || ''}&tr=${activeQr.id}&tn=Payment%20to%20Telering&am=${amount}&cu=INR`;
  };

  const upiString = getUpiString();
  const dynamicUpiString = getUpiString(Number(dynamicAmount) || 0);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-body centered-content">
          <div className="qr-tabs card">
            <button className={activeTab === 'My QR' ? 'active' : ''} onClick={() => setActiveTab('My QR')}>My QR Code</button>
            <button className={activeTab === 'Dynamic' ? 'active' : ''} onClick={() => setActiveTab('Dynamic')}>Dynamic QR</button>
            <button className={activeTab === 'Assigned' ? 'active' : ''} onClick={() => setActiveTab('Assigned')}>Assigned QRs ({myQrs.length})</button>
          </div>

          {activeTab === 'My QR' && (
            <>
              <div className="qr-header-section">
                <div className="qr-icon-label">📱 Payment QR Code</div>
                <h2>Your Payment QR Code</h2>
                <p className="subtitle">
                    {activeQr 
                        ? `Showing ${activeQr.label} (Rotating between ${myQrs.length} QRs)` 
                        : "Wait for admin to assign QR codes to your account."}
                </p>
              </div>

              <div className="qr-card-exact card">
                <div className="qr-card-header">
                    <span className="pay-label">PAYUPI</span>
                    <h3 className="merchant-name">{user?.name || 'Merchant'}</h3>
                    <div className="merchant-id-badge">
                       <span>{activeQr?.mid || user?.partnerId || 'MERCHANT_ID'}</span>
                       <button className="copy-btn">📋</button>
                    </div>
                </div>
                
                <div className="qr-code-body">
                  <div className="qr-frame" onClick={() => activeQr?.imagePath && window.open(`http://localhost:4001${activeQr.imagePath}`, '_blank')} style={{ cursor: activeQr?.imagePath ? 'zoom-in' : 'default' }}>
                    {activeQr ? (
                        activeQr.imagePath ? (
                          <img 
                            src={`http://localhost:4001${activeQr.imagePath}`} 
                            alt="Original QR" 
                            style={{ width: '280px', height: '280px', objectFit: 'contain', borderRadius: '8px' }} 
                          />
                        ) : (
                          <QRCodeSVG 
                              value={upiString} 
                              size={280}
                              level="H"
                              includeMargin={true}
                          />
                        )
                    ) : (
                        <div className="qr-placeholder" style={{width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#666', borderRadius: '12px'}}>
                            No QR Assigned
                        </div>
                    )}
                  </div>
                </div>
                {activeQr?.tid && (
                    <div className="qr-footer-info" style={{marginTop: '1rem', textAlign: 'center', opacity: 0.6, fontSize: '0.8rem'}}>
                        Target TID: {activeQr.tid}
                    </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'Dynamic' && (
            <div className="dynamic-qr-section card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
              <div className="qr-header-section" style={{ marginBottom: '2rem' }}>
                <div className="qr-icon-label">⚡ Real-time QR</div>
                <h2>Generate Dynamic QR</h2>
                <p className="subtitle">Enter amount to create a one-time payment QR.</p>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Amount (₹)</label>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>₹</span>
                    <input 
                        type="number" 
                        placeholder="0.00" 
                        value={dynamicAmount}
                        onChange={(e) => setDynamicAmount(e.target.value)}
                        style={{ width: '100%', padding: '1rem 1rem 1rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1.25rem', fontWeight: '700' }}
                    />
                </div>
              </div>

              {Number(dynamicAmount) > 0 && activeQr ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="qr-frame" style={{ background: 'white', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                    <QRCodeSVG 
                        value={dynamicUpiString} 
                        size={240}
                        level="H"
                        includeMargin={true}
                    />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'white', fontWeight: '700', fontSize: '1.125rem' }}>Pay ₹{dynamicAmount}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Scan and pay using any UPI app</p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💸</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
                        {!activeQr ? "Wait for admin to assign QRs" : "Enter an amount to generate QR"}
                    </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Assigned' && (
            <div className="assigned-qrs-section card" style={{ maxWidth: '800px', width: '100%', padding: '2rem' }}>
              <div className="qr-header-section" style={{ marginBottom: '2rem' }}>
                <div className="qr-icon-label">📁 Inventory</div>
                <h2>Assigned QR Codes</h2>
                <p className="subtitle">List of all payment identifiers linked to your account.</p>
              </div>

              {myQrs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {myQrs.map(q => (
                    <div key={q.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>{q.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>TID: {q.tid || 'N/A'}</div>
                        </div>
                        <span style={{ fontSize: '0.625rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: '800' }}>{q.status.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', wordBreak: 'break-all', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        {q.upiId}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                    No assigned QR codes found.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default QrCodesPage;
