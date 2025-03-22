import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCamera, FaTrash, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2'; 
import '../styles/Profile.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditingPhoto, setIsEditingPhoto] = useState(false); 
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editedInfo, setEditedInfo] = useState({
        firstName: '',
        lastName: '',
        course: '',
        height: '',
        weight: '',
        gender: '',
        age: '',
        phoneNumber: ''
    });
    const [phoneError, setPhoneError] = useState('');
    const navigate = useNavigate();

    const fetchUserProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                Swal.fire({
                    title: 'Authentication Required',
                    text: 'Please sign in to view your profile',
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

            setUser(response.data);
            setEditedInfo({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                course: response.data.course,
                height: response.data.height,
                weight: response.data.weight,
                gender: response.data.gender,
                age: response.data.age,
                phoneNumber: response.data.phoneNumber
            });
            setLoading(false);

        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
            
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
            } else {
                Swal.fire({
                    title: '[ ERROR ]',
                    text: 'Failed to load profile data. Please try again.',
                    icon: 'error',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< OK >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                });
            }
        }
    }, [navigate]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(selectedFile);

        // Cleanup
        return () => {
            fileReader.abort();
        };
    }, [selectedFile]);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                Swal.fire({
                    title: '[ FILE TOO LARGE ]',
                    text: 'Profile picture must be less than 5MB',
                    icon: 'error',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< OK >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                });
                event.target.value = null; // Reset file input
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
            if (!validTypes.includes(file.type)) {
                Swal.fire({
                    title: '[ INVALID FILE TYPE ]',
                    text: 'Supported formats: JPG, PNG, GIF, WebP, BMP, TIFF',
                    icon: 'error',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< OK >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                });
                event.target.value = null;
                return;
            }

            setSelectedFile(file);
            setIsEditingPhoto(true); 
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            const result = await Swal.fire({
                title: '[ UPLOAD PHOTO ]',
                text: 'Do you want to upload this photo as your profile picture?',
                icon: 'question',
                background: 'rgba(16, 16, 28, 0.95)',
                showCancelButton: true,
                confirmButtonText: '< UPLOAD >',
                cancelButtonText: '< CANCEL >',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm',
                    cancelButton: 'swal2-cancel'
                }
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem("token");
                const formData = new FormData();
                formData.append("profilePicture", selectedFile);

                const response = await axios.post(`${API_URL}api/profile/upload-profile`, 
                    formData,
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
                
                setUser(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
                setIsEditingPhoto(false);
                setSelectedFile(null);
                setPreviewUrl(null);

                await Swal.fire({
                    title: '[ SUCCESS ]',
                    text: 'Profile picture updated successfully!',
                    icon: 'success',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< OK >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                Swal.fire({
                    title: 'Session Expired',
                    text: 'Please sign in again to continue',
                    icon: 'info',
                    confirmButtonText: 'Sign In'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/signin');
                    }
                });
            } else {
                Swal.fire({
                    title: 'Upload Failed',
                    text: error.response?.data?.error || 'Failed to upload profile picture',
                    icon: 'error'
                });
            }
        }
    };

    const handleDelete = async () => {
        try {
            const result = await Swal.fire({
                title: '[ DELETE PHOTO ]',
                text: 'Are you sure you want to delete your profile picture?',
                icon: 'warning',
                background: 'rgba(16, 16, 28, 0.95)',
                showCancelButton: true,
                confirmButtonText: '< DELETE >',
                cancelButtonText: '< CANCEL >',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm',
                    cancelButton: 'swal2-cancel'
                }
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem("token");
                await axios.delete(`${API_URL}api/profile/delete-profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setUser(prev => ({ ...prev, profilePicture: "" }));
                setIsEditingPhoto(false);
                setSelectedFile(null);
                setPreviewUrl(null);

                await Swal.fire({
                    title: '[ SUCCESS ]',
                    text: 'Profile picture deleted successfully!',
                    icon: 'success',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< OK >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                });
            }
        } catch (error) {
            console.error("Error deleting profile picture:", error);
            Swal.fire({
                title: '[ ERROR ]',
                text: 'Failed to delete profile picture. Please try again.',
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonText: '< OK >',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm'
                }
            });
        }
    };

    const cancelEdit = () => {
        setIsEditingPhoto(false);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleUpdateInfo = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${API_URL}api/profile/update-info`,
                {
                    ...editedInfo,
                    height: parseFloat(editedInfo.height),
                    weight: parseFloat(editedInfo.weight),
                    age: parseInt(editedInfo.age)
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            setUser(prev => ({
                ...prev,
                ...response.data
            }));
            
            await Swal.fire({
                title: '[ SUCCESS ]',
                text: 'Profile information updated successfully!',
                icon: 'success',
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonText: '< OK >',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm'
                }
            });
            
            setIsEditingInfo(false);
        } catch (error) {
            console.error("Error updating info:", error);
            Swal.fire({
                title: '[ ERROR ]',
                text: error.response?.data?.error || 'Failed to update information',
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonText: '< OK >',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm'
                }
            });
        }
    };

    // Update the togglePrivacy function
    const togglePrivacy = async () => {
        try {
            const result = await Swal.fire({
                title: '[ CHANGE PRIVACY ]',
                text: `Are you sure you want to make your profile ${user.isPrivate ? 'public' : 'private'}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: user.isPrivate ? '< MAKE PUBLIC >' : '< MAKE PRIVATE >',  // Remove < > symbols
                cancelButtonText: '< CANCEL >',  // Simplified text
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonColor: '#00ff84',
                cancelButtonColor: '#ff4444',
                backdrop: `rgba(0,0,0,0.8)`
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                await axios.put(
                    `${API_URL}api/profile/toggle-privacy`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` }}
                );

                setUser(prev => ({
                    ...prev,
                    isPrivate: !prev.isPrivate
                }));

                await Swal.fire({
                    title: '[ SUCCESS ]',
                    text: `Profile is now ${!user.isPrivate ? 'private' : 'public'}`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: 'rgba(16, 16, 28, 0.95)'
                });
            }
        } catch (error) {
            console.error('Privacy toggle error:', error);
            Swal.fire({
                title: '[ ERROR ]',
                text: 'Failed to update privacy settings',
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)'
            });
        }
    };

    // Add validation function
    const validatePhoneNumber = (number) => {
        if (!number.startsWith('+63')) return false;
        const digits = number.slice(3);
        return digits.length === 10 && /^\d+$/.test(digits);
    };

    const handlePrivacyToggle = async () => {
        const result = await Swal.fire({
            title: 'Change Profile Privacy',
            text: `Are you sure you want to make your profile ${formData.isPrivate ? 'public' : 'private'}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            background: 'rgba(16, 16, 28, 0.95)',
            confirmButtonColor: '#00ff84',
            cancelButtonColor: '#ff4444'
        });

        if (result.isConfirmed) {
            setFormData(prev => ({
                ...prev,
                isPrivate: !prev.isPrivate
            }));
        }
    };

    if (loading) {
        return <div className="loading-container">Loading user profile...</div>;
    }

    if (!user) {
        return <div className="error-container">Error loading profile. Please try again.</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <h2 className="profile-picture-title">My Profile </h2>
                    <div className="profile-picture-container">
                        {previewUrl ? (
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                style={{ 
                                    width: '250px', 
                                    height: '250px', 
                                    objectFit: 'cover',
                                    borderRadius: '50%'  
                                }}
                            />
                        ) : user.profilePicture ? (
                            <img 
                                src={user.profilePicture}  
                                alt="Profile" 
                                style={{ 
                                    width: '250px', 
                                    height: '250px', 
                                    objectFit: 'cover',
                                    borderRadius: '50%'  
                                }}
                            />
                        ) : (
                            <FaUser style={{ 
                                width: '80px', 
                                height: '80px', 
                                color: '#00ff84' 
                            }} />
                        )}

                        <button 
                            className={`icon-button ${isEditingPhoto ? 'close-photo-button' : 'camera-button'}`}
                            onClick={() => isEditingPhoto ? cancelEdit() : setIsEditingPhoto(true)}
                            title={isEditingPhoto ? "Close editing" : "Edit profile picture"}
                        >
                            {isEditingPhoto ? <FaTimes /> : <FaCamera />}
                        </button>
                    </div>

                    {isEditingPhoto && ( 
                        <div className="edit-controls">
                            <div className="file-input-container">
                                <input 
                                    type="file" 
                                    id="profile-upload"
                                    onChange={handleFileChange}
                                    accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff"
                                    className="file-input"
                                />
                                <label htmlFor="profile-upload" className="file-input-label">
                                    Choose Photo
                                </label>
                                {selectedFile && (
                                    <span className="selected-file">{selectedFile.name}</span>
                                )}
                            </div>
                            <div className="action-buttons">
                                {selectedFile && (
                                    <button 
                                        className="upload-button"
                                        onClick={handleUpload}
                                    >
                                        Upload
                                    </button>
                                )}
                                {user.profilePicture && (
                                    <button 
                                        className="delete-button"
                                        onClick={handleDelete}
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Move edit button here, right after profile-header */}
                <div className="edit-button-container">
                    {!isEditingInfo && (
                        <button 
                            className="edit-button" 
                            onClick={() => {
                                setEditedInfo({
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    course: user.course,
                                    height: user.height,
                                    weight: user.weight,
                                    gender: user.gender,
                                    age: user.age,
                                    phoneNumber: user.phoneNumber
                                });
                                setIsEditingInfo(true);
                            }}
                        >
                            Edit Information
                        </button>
                    )}
                </div>

                <div className="privacy-toggle">
                    <button 
                        className={`toggle-button ${user?.isPrivate ? 'private' : 'public'}`}
                        onClick={togglePrivacy}
                    >
                        {user?.isPrivate ? 'Private Profile' : 'Public Profile'}
                    </button>
                </div>

                <div className="profile-info">
                    <h2>Profile Information</h2>
                    {isEditingInfo ? (
                        <div className="edit-info-form">
                            <div className="info-grid">

                            <div className="info-item">
                                    <label>Email</label>
                                    <p>{user.email}</p>
                                </div>
                                <div className="info-item">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={editedInfo.firstName}
                                        onChange={(e) => setEditedInfo(prev => ({
                                            ...prev,
                                            firstName: e.target.value
                                        }))}
                                        className="edit-info-input"
                                    />
                                </div>
                                <div className="info-item">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={editedInfo.lastName}
                                        onChange={(e) => setEditedInfo(prev => ({
                                            ...prev,
                                            lastName: e.target.value
                                        }))}
                                        className="edit-info-input"
                                    />
                                </div>

                                <div className="info-item">
                                    <label>Gender</label>
                                    <select
                                        value={editedInfo.gender}
                                        onChange={(e) => setEditedInfo(prev => ({
                                            ...prev,
                                            gender: e.target.value
                                        }))}
                                        className="edit-info-input"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="info-item">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        value={editedInfo.age}
                                        onChange={(e) => setEditedInfo(prev => ({
                                            ...prev,
                                            age: e.target.value
                                        }))}
                                        min="16"
                                        max="100"
                                        className="edit-info-input"
                                    />
                                </div>

 <div className="info-item">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={editedInfo.phoneNumber}
                                        onChange={(e) => {
                                            let value = e.target.value;
                                            if (!value.startsWith('+639')) {
                                                value = '+639';
                                            }
                                            const numbersOnly = value.slice(4).replace(/\D/g, '');
                                            if (numbersOnly.length <= 9) {
                                                setEditedInfo(prev => ({
                                                    ...prev,
                                                    phoneNumber: '+639' + numbersOnly
                                                }));
                                            }
                                        }}
                                        className="edit-info-input"
                                        placeholder="+639XXXXXXXXX"
                                    />
                                </div>
                               
                                <div className="info-item">
                                    <label>Course</label>
                                    <select
                                        value={editedInfo.course}
                                        onChange={(e) => setEditedInfo(prev => ({
                                            ...prev,
                                            course: e.target.value
                                        }))}
                                        className="edit-info-input"
                                    >
                                        <option value="BSCS">BSCS</option>
                                        <option value="BSIT">BSIT</option>
                                    </select>
                                </div>
                                <div className="info-item">
                                    <label>Height (cm)</label>
                                    <input
                                        type="number"
                                        value={editedInfo.height}
                                        onChange={(e) => setEditedInfo(prev => ({
                                            ...prev,
                                            height: e.target.value
                                        }))}
                                        min="100"
                                        max="250"
                                        placeholder="Max: 250 cm"
                                        className="edit-info-input"
                                    />
                                </div>
                                <div className="info-item">
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={editedInfo.weight}
                                        onChange={(e) => setEditedInfo(prev => ({
                                            ...prev,
                                            weight: e.target.value
                                        }))}
                                        min="30"
                                        max="500"
                                        placeholder="Max: 500 kg"
                                        className="edit-info-input"
                                    />
                                </div>
                               
                               
                               
                            </div>
                            <div className="action-buttons">
                                <button className="save-button" onClick={handleUpdateInfo}>
                                    Save Changes
                                </button>
                                <button className="cancel-button" onClick={() => setIsEditingInfo(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="info-grid">
                            {/* First Row */}
                            <div className="info-item">
                                <label>Email</label>
                                <p>{user.email}</p>
                            </div>
                            <div className="info-item">
                                <label>First Name</label>
                                <p>{user.firstName}</p>
                            </div>
                            <div className="info-item">
                                <label>Last Name</label>
                                <p>{user.lastName}</p>
                            </div>

                            {/* Second Row */}
                            <div className="info-item">
                                <label>Gender</label>
                                <p>{user.gender}</p>
                            </div>
                            <div className="info-item">
                                <label>Age</label>
                                <p>{user.age}</p>
                            </div>
                            <div className="info-item">
                                <label>Phone Number</label>
                                <p>{user.phoneNumber}</p>
                            </div>

                            {/* Third Row */}
                            <div className="info-item">
                                <label>Course</label>
                                <p>{user.course}</p>
                            </div>
                            <div className="info-item">
                                <label>Height</label>
                                <p>{user.height} cm</p>
                            </div>
                            <div className="info-item">
                                <label>Weight</label>
                                <p>{user.weight} kg</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;