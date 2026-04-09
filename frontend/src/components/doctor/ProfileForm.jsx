import React, { useState } from 'react';
import './ProfileForm.css';

function ProfileForm({ doctor, onSave }) {
  const [formData, setFormData] = useState(doctor || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClinicChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      clinic: {
        ...prev.clinic,
        [name]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <h2>Edit Your Profile</h2>

      <div className="form-section">
        <h3>Professional Information</h3>
        
        <div className="form-group">
          <label>Specialization</label>
          <select
            name="specialization"
            value={formData.specialization || ''}
            onChange={handleChange}
          >
            <option value="">Select Specialization</option>
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
          <label>Qualifications (comma-separated)</label>
          <input
            type="text"
            name="qualifications"
            value={Array.isArray(formData.qualifications) ? formData.qualifications.join(', ') : formData.qualifications || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              qualifications: e.target.value.split(',').map(q => q.trim())
            }))}
            placeholder="e.g., MBBS, MD, MRCP"
          />
        </div>

        <div className="form-group">
          <label>Years of Experience</label>
          <input
            type="number"
            name="experience"
            value={formData.experience || ''}
            onChange={handleChange}
            placeholder="e.g., 10"
          />
        </div>

        <div className="form-group">
          <label>Consultation Fee (₹)</label>
          <input
            type="number"
            name="consultationFee"
            value={formData.consultationFee || ''}
            onChange={handleChange}
            placeholder="e.g., 500"
          />
        </div>

        <div className="form-group">
          <label>Total Reviews</label>
          <input
            type="number"
            value={formData.totalReviews || 0}
            disabled
            placeholder="Auto-calculated"
          />
        </div>

        <div className="form-group">
          <label>Rating</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={formData.rating || 0}
            disabled
            placeholder="Auto-calculated"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Clinic Information</h3>

        <div className="form-group">
          <label>Clinic Name</label>
          <input
            type="text"
            name="clinicName"
            value={formData.clinicName || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              clinicName: e.target.value,
              clinic: { ...prev.clinic, name: e.target.value }
            }))}
            placeholder="Clinic name"
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              address: e.target.value,
              clinic: { ...prev.clinic, address: e.target.value }
            }))}
            placeholder="Full address"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="number"
              name="latitude"
              step="0.0001"
              value={formData.location?.coordinates?.[1] || formData.clinic?.latitude || ''}
              onChange={(e) => {
                const lat = parseFloat(e.target.value);
                setFormData(prev => ({
                  ...prev,
                  location: {
                    type: 'Point',
                    coordinates: [prev.location?.coordinates?.[0] || 0, lat]
                  },
                  clinic: { ...prev.clinic, latitude: lat }
                }));
              }}
              placeholder="e.g., 40.7128"
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input
              type="number"
              name="longitude"
              step="0.0001"
              value={formData.location?.coordinates?.[0] || formData.clinic?.longitude || ''}
              onChange={(e) => {
                const lng = parseFloat(e.target.value);
                setFormData(prev => ({
                  ...prev,
                  location: {
                    type: 'Point',
                    coordinates: [lng, prev.location?.coordinates?.[1] || 0]
                  },
                  clinic: { ...prev.clinic, longitude: lng }
                }));
              }}
              placeholder="e.g., -74.0060"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Current Queue Size</label>
          <input
            type="number"
            value={formData.currentQueueSize || 0}
            disabled
            placeholder="Auto-updated"
          />
        </div>

        <div className="verification-status">
          {formData.isVerified ? (
            <p className="verified">✅ Verified by Admin</p>
          ) : (
            <p className="pending">⏳ Pending Admin Verification</p>
          )}
        </div>
      </div>

      <button type="submit" className="save-btn">Save Changes</button>
    </form>
  );
}

export default ProfileForm;
