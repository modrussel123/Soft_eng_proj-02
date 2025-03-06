// frontend/src/components/Header.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SettingsDropdown from './SettingsDropdown';
import '../styles/Header.css';

function Header() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="header-wrapper">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo-container">
            <h1 className="header-title">Track Tech Fit</h1>
          </Link>
          
          <div className="header-right">
            <nav className="nav-links">
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link 
                to="/workouts" 
                className={`nav-link ${location.pathname === '/workouts' ? 'active' : ''}`}
              >
                Workouts
              </Link>
              <Link 
                to="/leaderboard" 
                className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
              >
                Leaderboard
              </Link>
            </nav>
            <div className="settings-wrapper">
              <SettingsDropdown />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;