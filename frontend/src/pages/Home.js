import React from 'react';
import { FaDumbbell } from 'react-icons/fa';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-page">
      <div className="home-container">
        <div className="page-header">
          <FaDumbbell className="header-icon" />
          <h2>Track Tech Fit</h2>
          <FaDumbbell className="header-icon mirror" />
        </div>
        <div className="welcome-text">Welcome</div>
      </div>
    </div>
  );
}

export default Home;
