import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBicycle, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaArrowRight, FaRuler, FaWeight, FaVenusMars, FaBirthdayCake, FaPhone } from 'react-icons/fa';
import Swal from 'sweetalert2';
import '../styles/Signup.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [course, setCourse] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+639');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const formatPhoneNumber = (input) => {
    // Remove all non-digit characters
    const numbers = input.replace(/\D/g, '');
    
    // If it starts with 0, replace it with +63
    if (numbers.startsWith('0')) {
      return '+63' + numbers.slice(1);
    }
    
    // If it doesn't start with +63, add it
    if (!numbers.startsWith('63')) {
      return '+63' + numbers;
    }
    
    return '+' + numbers;
  };

  const validatePhoneNumber = (number) => {
    return /^\+639\d{9}$/.test(number);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.com$/.test(email);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`${API_URL}api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                firstName, 
                lastName, 
                email, 
                password,
                course,
                height: parseFloat(height),
                weight: parseFloat(weight),
                gender,
                age: parseInt(age),
                phoneNumber
            })
        });

        if (response.ok) {
            // Show success animation
            await Swal.fire({
                title: 'Registration Successful!',
                text: 'Welcome to GymFlow!',
                icon: 'success',
                showConfirmButton: false,
                timer: 2000,
                background: 'rgba(16, 16, 28, 0.95)',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    content: 'swal-custom-content',
                    icon: 'swal-custom-icon'
                },
                didOpen: () => {
                    // Add custom animation for the success icon
                    Swal.getIcon().style.animation = 'none';
                    Swal.getIcon().style.border = 'none';
                    Swal.getIcon().style.backgroundColor = 'transparent';
                }
            });
            
            // Navigate to signin page after animation
            navigate('/signin');
        } else {
            const data = await response.json();
            Swal.fire({
                title: 'Registration Failed',
                text: data.error || 'Sign up failed',
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonColor: '#00ff84',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    content: 'swal-custom-content'
                }
            });
        }
    } catch (error) {
        console.error('Sign up error:', error);
        Swal.fire({
            title: 'Error',
            text: 'An unexpected error occurred',
            icon: 'error',
            background: 'rgba(16, 16, 28, 0.95)',
            confirmButtonColor: '#00ff84',
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                content: 'swal-custom-content'
            }
        });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">GYMFLOW</h1>
          <p className="signup-subtitle">Join the Community</p>
        </div>
        
        <form className="signup-form" onSubmit={handleSignUp}>
        <div className="signup-input-container">
            <FaEnvelope className="signup-input-icon" />
            <input
                type="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    if (!validateEmail(e.target.value)) {
                        setEmailError('Please enter a valid email address ending with .com');
                    } else {
                        setEmailError('');
                    }
                }}
                placeholder="Email"
                className={`signup-input ${emailError ? 'error' : ''}`}
                required
            />
            {emailError && <div className="error-message">{emailError}</div>}
        </div>
          
          <div className="signup-input-container">
            <FaUser className="signup-input-icon" />
            <input 
              type="text" 
              placeholder="First Name" 
              className="signup-input"
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              required 
            />
          </div>
          <div className="signup-input-container">
            <FaUser className="signup-input-icon" />
            <input 
              type="text" 
              placeholder="Last Name" 
              className="signup-input"
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              required 
            />
          </div>
         
          <div className="signup-input-container">
            <FaVenusMars className="signup-input-icon" />
            <select 
              className="signup-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="signup-input-container">
            <FaBirthdayCake className="signup-input-icon" />
            <input 
              type="number"
              placeholder="Age" 
              className="signup-input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="16"
              max="100"
              required 
            />
          </div>


          <div className="signup-input-container">
            <FaPhone className="signup-input-icon" />
            <div className="phone-input-wrapper">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  let value = e.target.value;
                  if (!value.startsWith('+639')) {
                    value = '+639';
                  }
                  const numbersOnly = value.slice(4).replace(/\D/g, '');
                  if (numbersOnly.length <= 9) {
                    setPhoneNumber('+639' + numbersOnly);
                  }
                }}
                onBlur={() => {
                  if (!validatePhoneNumber(phoneNumber)) {
                    setPhoneError('Please enter a valid phone number');
                  } else {
                    setPhoneError('');
                  }
                }}
                placeholder="9XXXXXXXXX"
                className={`signup-input ${phoneError ? 'error' : ''}`}
                required
              />
            </div>
            {phoneError && <div className="error-message">{phoneError}</div>}
          </div>
          
          <div className="signup-input-container">
            <select 
              className="signup-input"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            >
              <option value="">Select Course</option>
              <option value="BSCS">BSCS</option>
              <option value="BSIT">BSIT</option>
            </select>
          </div>

          <div className="signup-input-container">
            <FaRuler className="signup-input-icon" />
            <input 
              type="number"
              placeholder="Height (140-250 cm)" 
              className="signup-input"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="140"  // Changed from 100 to 140
              max="250"
              required 
            />
          </div>

          <div className="signup-input-container">
            <FaWeight className="signup-input-icon" />
            <input 
              type="number"
              placeholder="Weight (40-500 kg)" 
              className="signup-input"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="40"   // Changed from 30 to 40
              max="500"
              required 
            />
          </div>


          <div className="signup-input-container">
            <FaLock className="signup-input-icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="signup-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              autoComplete="new-password"
            />
            <div 
              className="signup-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEye className="signup-password-icon" />
              ) : (
                <FaEyeSlash className="signup-password-icon" />
              )}
            </div>
          </div>
          <button type="submit" className="signup-button">
            SIGN UP
          </button>
        </form>
        <div className="signup-login-link">
          Already have an account? <a href="/signin">Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default SignUp;