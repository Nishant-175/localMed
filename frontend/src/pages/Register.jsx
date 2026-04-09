import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient',
    // Doctor-specific fields
    specialty: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    clinicName: '',
    clinicAddress: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
        },
        () => alert('Unable to get your location. Please enter manually.')
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const doctorData = formData.role === 'doctor' ? {
        specialty: formData.specialty,
        qualifications: formData.qualifications,
        experience: parseInt(formData.experience) || 0,
        consultationFee: parseInt(formData.consultationFee) || 0,
        clinic: {
          name: formData.clinicName,
          address: formData.clinicAddress,
          latitude: parseFloat(formData.latitude) || 0,
          longitude: parseFloat(formData.longitude) || 0
        }
      } : null;

      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.phone,
        doctorData
      );
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h1>Create Account</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>I am a:</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor/Clinic</option>
              </select>
            </div>
          </div>

          {formData.role === 'doctor' && (
            <>
              <div className="form-section">
                <h3>Professional Information</h3>
                
                <div className="form-group">
                  <label>Specialty *</label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Specialty</option>
                    <option value="General Practitioner">General Practitioner</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Gastroenterologist">Gastroenterologist</option>
                    <option value="ENT">ENT</option>
                    <option value="Gynecologist">Gynecologist</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Qualifications (e.g., MBBS, MD) *</label>
                  <input
                    type="text"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    placeholder="e.g., MBBS, MD, MRCP"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Years of Experience *</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Consultation Fee ($) *</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Clinic Information</h3>
                
                <div className="form-group">
                  <label>Clinic Name *</label>
                  <input
                    type="text"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleChange}
                    placeholder="Your clinic name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Clinic Address *</label>
                  <input
                    type="text"
                    name="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={handleChange}
                    placeholder="Full clinic address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="location-btn"
                  >
                    📍 Get My Location
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="e.g., 40.7128"
                    />
                  </div>

                  <div className="form-group">
                    <label>Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="e.g., -74.0060"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
