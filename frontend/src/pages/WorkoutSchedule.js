import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { BODYWEIGHT_EXERCISES } from './bodyWeightConstants';
import { DUMBBELL_EXERCISES } from './dumbbellConstants';
import { MACHINE_EXERCISES } from './machineConstants';
import { BARBELL_EXERCISES } from './barbellConstants';
import '../styles/WorkoutSchedule.css';
import Swal from 'sweetalert2'; 

import { useNavigate } from 'react-router-dom';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`schedule-toast ${type}`}>
            <span>{message}</span>
        </div>
    );
};

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <p>{message}</p>
            <div className="confirm-actions">
                <button className="button-cancel" onClick={onCancel}>Cancel</button>
                <button className="button-delete confirm" onClick={onConfirm}>Delete</button>
            </div>
        </div>
    </div>
);

const WorkoutSchedule = () => {
    const navigate = useNavigate();
    const [token] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (!token) {
            navigate('/signin');
            return;
        }
    }, [token, navigate]);

    if (!token) {
        return null;
    }

    const [toasts, setToasts] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [workoutId, setWorkoutId] = useState(null);
    const [category, setCategory] = useState('');
    const [target, setTarget] = useState('');
    const [exerciseName, setExerciseName] = useState('');
    const [workoutTime, setWorkoutTime] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [availableTargets, setAvailableTargets] = useState([]);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState({
        show: false,
        workoutId: null,
        message: ""
    });

    const API_URL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        fetchWorkouts();
    }, []);

    useEffect(() => {
        if (category && isEditing) {
            handleCategoryChange(category);
        }
    }, [category]);

    useEffect(() => {
        if (target && isEditing) {
            handleTargetChange(target);
        }
    }, [target]);

    const fetchWorkouts = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                Swal.fire({
                    title: '[ SESSION EXPIRED ]',
                    text: 'Please sign in to view your workouts',
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

            const response = await axios.get(`${API_URL}api/workout-schedule`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkouts(response.data);
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

    const handleCategoryChange = (selectedCategory) => {
        setCategory(selectedCategory);
        setTarget('');
        setExerciseName('');
        
        // Set available targets based on category
        let targets = [];
        switch (selectedCategory) {
            case 'Bodyweight':
                targets = Object.keys(BODYWEIGHT_EXERCISES);
                break;
            case 'Dumbbell':
                targets = Object.keys(DUMBBELL_EXERCISES);
                break;
            case 'Machine':
                targets = Object.keys(MACHINE_EXERCISES);
                break;
            case 'Barbell':
                targets = Object.keys(BARBELL_EXERCISES);
                break;
            default:
                targets = [];
        }
        setAvailableTargets(targets);
    };

    const handleTargetChange = (selectedTarget) => {
        setTarget(selectedTarget);
        setExerciseName('');
        
        // Set available exercises based on category and target
        let exercises = [];
        switch (category) {
            case 'Bodyweight':
                exercises = BODYWEIGHT_EXERCISES[selectedTarget] || [];
                break;
            case 'Dumbbell':
                exercises = DUMBBELL_EXERCISES[selectedTarget] || [];
                break;
            case 'Machine':
                exercises = MACHINE_EXERCISES[selectedTarget] || [];
                break;
            case 'Barbell':
                exercises = BARBELL_EXERCISES[selectedTarget] || [];
                break;
            default:
                exercises = [];
        }
        setAvailableExercises(exercises);
    };

    const showToast = (message, type) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        }, 3000);
    };

    // Update handleDateClick to include date validation
    const handleDateClick = (info) => {
        const selectedDate = new Date(info.dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            showToast("Cannot schedule workouts for past dates", "error");
            return;
        }

        setSelectedDate(info.dateStr);
        setWorkoutId(null);
        setCategory('');
        setTarget('');
        setExerciseName('');
        setWorkoutTime('');
        setIsEditing(false);
        setShowModal(true);
    };

    // Update the handleSaveWorkout function
    const handleSaveWorkout = async () => {
        try {
            const token = localStorage.getItem("token");
            const workoutData = {
                date: selectedDate,
                category,
                target,
                exerciseName,
                time: workoutTime
            };

            if (isEditing) {
                await axios.put(`${API_URL}api/workout-schedule/edit/${workoutId}`, 
                    workoutData,
                    { headers: { Authorization: `Bearer ${token}` }}
                );
                showToast("Workout updated successfully!", "success");
            } else {
                await axios.post(`${API_URL}api/workout-schedule/add`, 
                    workoutData,
                    { headers: { Authorization: `Bearer ${token}` }}
                );
                showToast("Workout added successfully!", "success");
            }
            
            fetchWorkouts();
            setShowModal(false);
        } catch (error) {
            console.error("Error saving workout:", error);
            showToast("Failed to save workout. Please try again.", "error");
        }
    };

    const handleEditWorkout = (workout) => {
        setWorkoutId(workout._id);
        setSelectedDate(workout.date);
        setWorkoutTime(workout.time);
        setIsEditing(true);
        setShowModal(true);

        setCategory(workout.category);
        handleCategoryChange(workout.category);

        Promise.resolve().then(() => {
            setTarget(workout.target);
            handleTargetChange(workout.target);

            Promise.resolve().then(() => {
                setExerciseName(workout.exerciseName);
            });
        });
    };

    const handleDeleteWorkout = (id) => {
        setShowConfirmModal({
            show: true,
            workoutId: id,
            message: "Are you sure you want to delete this workout?"
        });
    };

    const confirmDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_URL}api/workout-schedule/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setShowConfirmModal({ show: false, workoutId: null, message: "" });
            showToast("Workout deleted successfully", "success");
            fetchWorkouts(); 
        } catch (error) {
            console.error("Error deleting workout:", error);
            showToast("Failed to delete workout", "error");
        }
    };

    return (
        <div className="schedule-page">
            <div className="schedule-container">
                <div className="workout-list">
                    <h2>Scheduled Workouts</h2>
                    <div className="workout-items-container">
                        {workouts.map(workout => (
                            <div key={workout._id} className="workout-item">
                                <div className="workout-info">
                                    <span className="date">{workout.date}</span>
                                    <span className="details">
                                        {workout.exerciseName} ({workout.category}) at {workout.time}
                                    </span>
                                </div>
                                <div className="workout-actions">
                                    <button className="edit" onClick={() => handleEditWorkout(workout)}>
                                        <FaEdit /> Edit
                                    </button>
                                    <button className="delete" onClick={() => handleDeleteWorkout(workout._id)}>
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="schedule-modal" onClick={e => e.stopPropagation()}>
                            <h2>{isEditing ? "Edit Workout" : "Add Workout"} for {selectedDate}</h2>
                            
                            <div className="input-group">
                                <label>Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                >
                                    <option value="">Select category</option>
                                    <option value="Dumbbell">Dumbbell</option>
                                    <option value="Machine">Machine</option>
                                    <option value="Barbell">Barbell</option>
                                    <option value="Bodyweight">Bodyweight</option>
                                </select>
                            </div>

                            {category && (
                                <div className="input-group">
                                    <label>Target</label>
                                    <select
                                        value={target}
                                        onChange={(e) => handleTargetChange(e.target.value)}
                                    >
                                        <option value="">Select target</option>
                                        {availableTargets.map(target => (
                                            <option key={target} value={target}>{target}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {target && (
                                <div className="input-group">
                                    <label>Exercise</label>
                                    <select
                                        value={exerciseName}
                                        onChange={(e) => setExerciseName(e.target.value)}
                                    >
                                        <option value="">Select exercise</option>
                                        {availableExercises.map(exercise => (
                                            <option key={exercise} value={exercise}>{exercise}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="input-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={workoutTime}
                                    onChange={(e) => setWorkoutTime(e.target.value)}
                                />
                            </div>

                            <div className="modal-actions">
                                <button 
                                    className="button-cancel" 
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="button-save" 
                                    onClick={handleSaveWorkout}
                                >
                                    {isEditing ? 'Update' : 'Add'} Workout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="schedule-card">
                    <div className="schedule-header">
                        <h1>Workout Schedule</h1>
                    </div>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        dateClick={handleDateClick}
                        events={workouts.map(workout => ({
                            title: `${workout.exerciseName} (${workout.category})`,
                            date: workout.date,
                            allDay: true
                        }))}
                        headerToolbar={{
                            left: 'prev',
                            center: 'title',
                            right: 'next'
                        }}
                        height="auto"
                        contentHeight="auto"
                        aspectRatio={1.35}
                        handleWindowResize={true}
                        stickyHeaderDates={true}
                        fixedWeekCount={false}
                    />
                </div>
            </div>
            {/* Add toast container */}
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
                <div className="modal-overlay" onClick={() => setShowConfirmModal({ show: false, workoutId: null, message: "" })}>
                    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                        <p>{showConfirmModal.message}</p>
                        <div className="confirm-actions">
                            <button 
                                className="button-cancel" 
                                onClick={() => setShowConfirmModal({ show: false, workoutId: null, message: "" })}
                            >
                                Cancel
                            </button>
                            <button 
                                className="button-delete confirm" 
                                onClick={() => confirmDelete(showConfirmModal.workoutId)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutSchedule;