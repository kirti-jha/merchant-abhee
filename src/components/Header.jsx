import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = location.pathname.startsWith('/admin');

  const handleSettingsClick = () => {
    navigate(isAdmin ? '/admin/settings' : '/settings');
  };

  const { user } = { user: { name: 'Admin', role: 'admin' } }; // Use actual auth context if available

  return (
    <header className="main-header">
      <div className="header-left">
        <button className="menu-toggle">
          <span className="control-icon">☰</span>
        </button>
        <div className="header-search">
          <span className="header-search-icon">🔍</span>
          <input type="text" placeholder="Search transactions, merchants..." />
        </div>
      </div>
      
      <div className="header-right">
        <div className="header-control language-selector">
          <span className="control-icon">🌐</span>
          <span className="control-text">EN</span>
        </div>

        <button className="header-icon-btn">
          <span>🔔</span>
          <span className="notif-badge">3</span>
        </button>

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div className="header-user-chip" onClick={handleSettingsClick}>
          <div className="header-avatar">A</div>
          <div className="header-user-info">
            <span className="header-user-name">Admin</span>
            <span className="header-user-role">Super Admin</span>
          </div>
          <span className="header-arrow">▼</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
