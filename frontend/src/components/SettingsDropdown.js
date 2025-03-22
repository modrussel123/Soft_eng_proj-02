import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SettingsDropdown.css';
import { handleGlobalSignOut, confirmSignOut } from '../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const checkTokenValidity = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsTokenValid(false);
      setUser(null);
      return;
    }

    try {
      // Make a test request to verify token
      await axios.get(`${API_URL}api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsTokenValid(true);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsTokenValid(false);
        setUser(null);
      }
    }
  };

  useEffect(() => {
    // Initial check
    checkUserState();
    checkTokenValidity();

    // Set up polling for user state and token validity
    const intervalId = setInterval(() => {
      checkUserState();
      checkTokenValidity();
    }, 1000);

    // Handle clicks outside dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkUserState = () => {
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    
    // Only update state if there's a change
    if (JSON.stringify(user) !== JSON.stringify(currentUser)) {
      setUser(currentUser);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="settings-container">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        onMouseEnter={() => setIsOpen(true)}
        className="settings-button"
      >
        Settings
      </button>

      {isOpen && (
        <div 
          className="settings-dropdown"
          onMouseLeave={() => setIsOpen(false)}
        >
          <ul>
            {isTokenValid && user ? (
              <>
                <li>
                  <Link 
                    to="/profile" 
                    onClick={handleLinkClick}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/achievements" 
                    onClick={handleLinkClick}
                  >
                    Achievements
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/friends" 
                    onClick={handleLinkClick}
                  >
                    Friends
                  </Link>
                </li>
                <li>
                
                </li>
                <li>
                
                </li>
                <li>
                  <Link 
                    to="/schedule" 
                    onClick={handleLinkClick}
                  >
                    Workout Schedule
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => confirmSignOut(navigate)} 
                    className="signout-button"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to="/signin" 
                    onClick={handleLinkClick}
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/signup" 
                    onClick={handleLinkClick}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SettingsDropdown;