import React from 'react';
import { FaDumbbell, FaRunning, FaWeightHanging } from 'react-icons/fa';
import { GiWeightLiftingUp } from 'react-icons/gi'; 
import '../styles/Workouts.css';

function Workouts() {
  return (
    <div className="workouts-page">
      <div className="workouts-container">
        <div className="workouts-header">
          <h2>Workout Programs</h2>
        </div>

        <div className="workouts-grid">
          <div className="workout-card">
            <FaDumbbell className="workout-icon" />
            <h3>Dumbbell Workouts</h3>
          </div>

          <div className="workout-card">
            <GiWeightLiftingUp className="workout-icon" /> {}
            <h3>Machine Workouts</h3>
          </div>

          <div className="workout-card">
            <FaWeightHanging className="workout-icon" />
            <h3>Barbell Workouts</h3>
          </div>

          <div className="workout-card">
            <FaRunning className="workout-icon" />
            <h3>Bodyweight Workouts</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workouts;
