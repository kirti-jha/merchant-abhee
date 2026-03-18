import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { QRCodeSVG } from 'qrcode.react';
import './QrCodesPage.css';

const QrCodesPage = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-body centered-content">
          <div className="qr-tabs card">
            <button className="active">My QR Code</button>
            <button>Dynamic QR</button>
            <button>Assigned QRs</button>
          </div>

          <div className="qr-header-section">
            <div className="qr-icon-label">📱 Payment QR Code</div>
            <h2>Your Payment QR Code</h2>
            <p className="subtitle">Share this QR with customers to accept UPI payments instantly</p>
          </div>

          <div className="qr-card-exact card">
            <div className="qr-card-header">
                <span className="pay-label">PAYUPI</span>
                <h3 className="merchant-name">aryan a</h3>
                <div className="merchant-id-badge">
                   <span>MRCH26831518010482568</span>
                   <button className="copy-btn">📋</button>
                </div>
            </div>
            
            <div className="qr-code-body">
              <div className="qr-frame">
                <QRCodeSVG 
                    value="upi://pay?pa=everlifeproductsands..36199056@hdfcbank&pn=aryan%20a&mc=0000&tid=TXN123&tr=TXN123&tn=Payment%20to%20Telering&am=0&cu=INR" 
                    size={280}
                    level="H"
                    includeMargin={true}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QrCodesPage;
