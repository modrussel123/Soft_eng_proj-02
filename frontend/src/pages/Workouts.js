import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaListAlt,
  FaDumbbell,
  FaRegCalendarCheck,
  FaRunning
} from 'react-icons/fa';
import {
  GiMuscleUp,
  GiWeightScale,
  GiGymBag,
  GiStrong
} from 'react-icons/gi';
import Swal from 'sweetalert2';
import '../styles/Workouts.css';

function Workouts() {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem('token'));

  const handleNavigation = (path, feature) => {
    if (!token) {
      Swal.fire({
        title: '[ SIGN IN REQUIRED ]',
        text: `Please sign in first to ${feature}`,
        icon: 'warning',
        background: 'rgba(16, 16, 28, 0.95)',
        showCancelButton: true,
        confirmButtonText: '< SIGN IN >',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'swal2-popup',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm',
          cancelButton: 'swal2-cancel'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/signin');
        }
      });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="programs-page">
      <div className="programs-header-container">
        <h2>Workout Programs</h2>
        <div className="programs-navigation">
          <button 
            className="nav-button my-workout"
            onClick={() => handleNavigation('/my-workout', 'access your workouts')}
          >
            <FaListAlt className="nav-icon" />
            <span>My Workouts</span>
          </button>
          <button 
            className="nav-button weight-tracking"
            onClick={() => handleNavigation('/weight-tracking', 'track your weight progress')}
          >
            <FaRegCalendarCheck className="nav-icon" />
            <span>Track Progress</span>
          </button>
        </div>
      </div>
      
      <div className="program-container">
        <FaDumbbell className="program-icon" />
        <h3>Dumbbell Training</h3>
      </div>

      <div className="program-container">
        <GiGymBag className="program-icon" />
        <h3>Machine Exercises</h3>
      </div>

      <div className="program-container">
        <GiStrong className="program-icon" />
        <h3>Strength Training</h3>
      </div>

      <div className="program-container">
        <FaRunning className="program-icon" />
        <h3>Bodyweight Fitness</h3>
      </div>
    </div>
  );
}

export default Workouts;
