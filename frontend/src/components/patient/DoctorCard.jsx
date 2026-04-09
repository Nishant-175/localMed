import React from 'react';
import './DoctorCard.css';

function DoctorCard({ doctor, onBook }) {
  return (
    <div className="doctor-card">
      <div className="doctor-header">
        <div className="doctor-avatar">👨‍⚕️</div>
        <div className="doctor-info">
          <h3>{doctor.userId?.name}</h3>
          <p className="specialization">{doctor.specialization}</p>
        </div>
        <div className="availability">
          <span className={`status ${doctor.isAvailable ? 'available' : 'unavailable'}`}>
            {doctor.isAvailable ? '● Available' : '● Unavailable'}
          </span>
          {!doctor.isVerified && <span className="unverified">⚠️ Pending Verification</span>}
        </div>
      </div>

      <div className="doctor-details">
        <p><strong>Experience:</strong> {doctor.experience} years</p>
        <p><strong>Qualifications:</strong> {doctor.qualifications?.join(', ') || 'N/A'}</p>
        <p><strong>Rating:</strong> ⭐ {doctor.rating?.toFixed(1) || 'N/A'} ({doctor.totalReviews || 0} reviews)</p>
        <p><strong>Fee:</strong> ₹{doctor.consultationFee}/consultation</p>
        {doctor.clinicName && <p><strong>Clinic:</strong> {doctor.clinicName}</p>}
        {doctor.address && <p><strong>Location:</strong> {doctor.address}</p>}
        {doctor.currentQueueSize > 0 && (
          <p><strong>Queue:</strong> {doctor.currentQueueSize} patients waiting</p>
        )}
      </div>

      <button 
        className="book-btn" 
        onClick={() => onBook(doctor)}
        disabled={!doctor.isAvailable || !doctor.isVerified}
      >
        {!doctor.isVerified ? 'Not Verified' : doctor.isAvailable ? 'Book Now' : 'Not Available'}
      </button>
    </div>
  );
}

export default DoctorCard;
