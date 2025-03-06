import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy, FaDumbbell, FaFire } from 'react-icons/fa';
import "../styles/Achievements.css";

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
                const res = await axios.get(`http://localhost:5000/api/streaks?email=${email}`);
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

    if (loading) {
        return <div className="loading-container">Loading achievements...</div>;
    }

    return (
        <div className="achievements-container">
            <div className="achievements-card">
                <div className="achievements-header">
                    <FaTrophy className="trophy-icon" />
                    <h2>My Achievements</h2>
                </div>

              

                    <div className="workouts-grid">
                        {workouts.map((workout, index) => (
                            <div key={index} className="workout-card">
                                <p>{workout}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
    );
};

export default Achievements;