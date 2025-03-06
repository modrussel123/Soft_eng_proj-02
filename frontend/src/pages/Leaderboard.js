import React from 'react';
import { FaTrophy } from 'react-icons/fa';
import '../styles/Leaderboard.css';

function Leaderboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return (
      <div className="leaderboard-page">
        <div className="leaderboard-container">
          <div className="leaderboard-header">
            <FaTrophy className="trophy-icon" />
            <h2>Leaderboard</h2>
          </div>
          <div className="auth-message">
            <p>Please sign in to access the leaderboard</p>
            <button onClick={() => window.location.href = '/signin'} className="signin-btn">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <FaTrophy className="trophy-icon" />
          <h2>Leaderboard</h2>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
