import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy, FaDumbbell, FaFire } from 'react-icons/fa';
import "../styles/Achievements.css";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Achievements = () => {
    const [streak, setStreak] = useState(0);
    const [workouts, setWorkouts] = useState([]);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && storedUser.email) {
            setEmail(storedUser.email);
        }
    }, []);

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!email) return;

            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}api/streaks?email=${email}`);
                setStreak(res.data.streakCount);
                setWorkouts(res.data.addedWorkouts);
            } catch (error) {
                console.error("❌ Error fetching streaks:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, [email]);

    return (
        <div className="achievements-page">
            <div className="achievements-main-container">
                <div className="achievements-section">
                    <div className="achievements-header">
                        <h2>My Achievements</h2>
                    </div>

                    {loading ? (
                        <div className="loading-message">Loading achievements...</div>
                    ) : (
                        <div className="achievements-grid">
                            {workouts.map((workout, index) => (
                                <div key={index} className="achievement-card">
                                    <p>{workout}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Achievements;