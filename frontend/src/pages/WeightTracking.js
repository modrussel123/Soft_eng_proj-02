import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import '../styles/WeightTracking.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Add Toast component at the top
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`weight-toast ${type}`}>
            <span>{message}</span>
        </div>
    );
};

// Add this after the Toast component
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <p>{message}</p>
            <div className="confirm-actions">
                <button className="cancel-button" onClick={onCancel}>Cancel</button>
                <button className="confirm-button" onClick={onConfirm}>Delete</button>
            </div>
        </div>
    </div>
);

const WeightTracking = () => {
    const navigate = useNavigate();
    const [token] = useState(localStorage.getItem('token'));
    const [weightInput, setWeightInput] = useState('');
    const [currentWeight, setCurrentWeight] = useState(0);
    const [weightHistory, setWeightHistory] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState({ show: false, id: null });
    const [error, setError] = useState(null); // Add this line with other useState declarations
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    // Add this useEffect at the top for authentication check
    useEffect(() => {
        if (!token) {
            navigate('/signin');
            return;
        }
    }, [token, navigate]);

    // If not authenticated, don't render the component
    if (!token) {
        return null;
    }

    useEffect(() => {
        fetchCurrentWeight();
        fetchWeightHistory();
    }, []);

    // Modify fetchCurrentWeight function
    const fetchCurrentWeight = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    title: '[ SESSION EXPIRED ]',
                    text: 'Please sign in to view your weight tracking',
                    icon: 'warning',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< SIGN IN >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/signin');
                    }
                });
                return;
            }

            const response = await axios.get(`${API_URL}api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentWeight(response.data.weight);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                Swal.fire({
                    title: '[ SESSION EXPIRED ]',
                    text: 'Your session has expired. Please sign in again.',
                    icon: 'warning',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< SIGN IN >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/signin');
                    }
                });
            }
        }
    };

    const fetchWeightHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}api/weight/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWeightHistory(response.data);
            setError(null); // Clear any existing errors
        } catch (error) {
            showToast('Failed to fetch weight history', 'error'); 
            setError('Failed to fetch weight history');
        }
    };

    // Update the handleWeightChange function
    const handleWeightChange = async (changeType) => {
        try {
            if (!weightInput) {
                showToast('Please enter a weight change value', 'error');
                return;
            }
    
            const change = parseFloat(weightInput);
            if (isNaN(change)) {
                showToast('Please enter a valid number', 'error');
                return;
            }
    
            // Add limits for weight changes
            if (changeType === 'increase' && change > 1) {
                showToast('Weight gain cannot exceed 1 kg per day', 'error');
                return;
            }
    
            if (changeType === 'decrease' && change > 2) {
                showToast('Weight loss cannot exceed 2 kg per day', 'error');
                return;
            }
    
            const newWeight = changeType === 'increase' ? 
                currentWeight + change : 
                currentWeight - change;
    
            if (newWeight < 40) {
                showToast('Weight cannot be less than 40 kg', 'error');
                return;
            }
    
            if (newWeight > 500) {
                showToast('Weight cannot exceed 500 kg', 'error');
                return;
            }
    
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Authentication required', 'error');
                navigate('/signin');
                return;
            }
    
            const response = await axios.post(
                `${API_URL}api/weight/log`,
                { weight: newWeight },
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (response.data.success) {
                setCurrentWeight(response.data.currentWeight);
                setWeightInput('');
                showToast(
                    `Weight successfully ${changeType === 'increase' ? 'increased' : 'decreased'} by ${change}kg`,
                    'success'
                );
                fetchWeightHistory();
                
                // Disable button for 3 seconds
                setIsButtonDisabled(true);
                setTimeout(() => {
                    setIsButtonDisabled(false);
                }, 3000);
            }
        } catch (error) {
            console.error('Error updating weight:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update weight';
            showToast(errorMessage, 'error');
        }
    };

    const showToast = (message, type) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        }, 3000);
    };

    const handleDelete = async (weightId) => {
        setShowConfirmModal({ show: true, id: weightId });
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}api/weight/${showConfirmModal.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('Weight record deleted successfully', 'success');
            fetchWeightHistory();
        } catch (error) {
            showToast('Failed to delete weight record', 'error');
        }
        setShowConfirmModal({ show: false, id: null });
    };

    const chartData = {
        labels: weightHistory.map(entry => 
            new Date(entry.date).toLocaleDateString()
        ).reverse(),
        datasets: [{
            label: 'Weight Progress',
            data: weightHistory.map(entry => entry.weight).reverse(),
            borderColor: '#00ff84',
            backgroundColor: 'rgba(0, 255, 132, 0.2)',
            tension: 0.4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#fff'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#fff'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#fff'
                }
            }
        }
    };

    return (
        <div className="weight-tracking-container">
            <div className="weight-tracking-card">
                <h1>Weight Tracking</h1>

                <div className="current-weight-display">
                    <h2>Current Weight</h2>
                    <div className="weight-value">{currentWeight} kg</div>
                </div>

                <div className="weight-input-section">
                    <h3>Update Weight</h3>
                    <div className="weight-input-wrapper">
                        <input
                            type="number"
                            value={weightInput}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0) {
                                    showToast('Weight change cannot be negative!', 'error');
                                    return;
                                }
                                if (value > 2) {
                                    showToast('Maximum weight change is 2 kg for loss and 1 kg for gain!', 'error');
                                    return;
                                }
                                setWeightInput(e.target.value);
                            }}
                            placeholder="Enter weight change"
                            step="0.1"
                            min="0"
                            max="2"
                            className="weight-input"
                        />
                    </div>
                    <div className="weight-buttons">
                        <button 
                            onClick={() => handleWeightChange('decrease')}
                            className={`weight-btn decrease ${isButtonDisabled ? 'disabled' : ''}`}
                            disabled={isButtonDisabled}
                        >
                            Lost -{weightInput || '0'} kg
                        </button>
                        <button 
                            onClick={() => handleWeightChange('increase')}
                            className={`weight-btn increase ${isButtonDisabled ? 'disabled' : ''}`}
                            disabled={isButtonDisabled}
                        >
                            Gained +{weightInput || '0'} kg
                        </button>
                    </div>
                </div>

                <div className="chart-container">
                    {weightHistory.length > 0 && (
                        <Line data={chartData} options={chartOptions} />
                    )}
                </div>

                <div className="weight-history">
                    <h2>History</h2>
                    <div className="history-list">
                        {weightHistory.map((entry) => (
                            <div key={entry._id} className="history-item">
                                <div className="history-info">
                                    <span className="date">
                                        {new Date(entry.date).toLocaleDateString()}
                                    </span>
                                    <span className="weight">{entry.weight} kg</span>
                                    <span className="email">{entry.userEmail}</span>
                                </div>
                                <button 
                                    className="delete-button"
                                    onClick={() => handleDelete(entry._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToasts(prevToasts => 
                            prevToasts.filter(t => t.id !== toast.id)
                        )}
                    />
                ))}
            </div>

            {showConfirmModal.show && (
                <ConfirmModal
                    message="Are you sure you want to delete this weight record?"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowConfirmModal({ show: false, id: null })}
                />
            )}
        </div>
    );
};

export default WeightTracking;