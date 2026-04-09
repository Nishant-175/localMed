import React, { useState } from 'react';
import api from '../../services/api';
import './AppointmentList.css';

function AppointmentList({ appointments, isDoctor = false, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    // If time is in HH:MM format
    if (typeof time === 'string' && time.includes(':')) {
      return time;
    }
    // If it's a Date object
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'confirmed';
      case 'pending': return 'pending';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return '';
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      await api.patch(`/appointments/${appointmentId}/complete`);
      alert('Appointment marked as completed');
      if (onRefresh) onRefresh();
    } catch (error) {
      alert('Error completing appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        setActionLoading(appointmentId);
        await api.patch(`/appointments/${appointmentId}/cancel`);
        alert('Appointment cancelled');
        if (onRefresh) onRefresh();
      } catch (error) {
        alert('Error cancelling appointment');
      } finally {
        setActionLoading(null);
      }
    }
  };

  return (
    <div className="appointment-list">
      <h2>Appointments {isDoctor ? 'Today' : ''}</h2>
      {appointments.length === 0 ? (
        <p className="empty-state">No appointments</p>
      ) : (
        <div className="appointments">
          {appointments.map(apt => (
            <div key={apt._id} className="appointment-item">
              <div className="appointment-main">
                <div className="appointment-info">
                  <h3>{apt.patientId?.name || 'Unknown Patient'}</h3>
                  <p className="date">
                    {formatDate(apt.appointmentDate)} at {formatTime(apt.startTime)}
                  </p>
                  {apt.urgency && <p className="urgency">Urgency: {apt.urgency}</p>}
                  {apt.symptoms && <p className="symptoms">{apt.symptoms}</p>}
                  <p className="reason">{apt.reason || 'General Consultation'}</p>
                </div>
                <div className={`status ${statusColor(apt.status)}`}>
                  {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </div>
              </div>

              {isDoctor && apt.status === 'confirmed' && (
                <div className="appointment-actions">
                  <button
                    className="btn-complete"
                    onClick={() => handleCompleteAppointment(apt._id)}
                    disabled={actionLoading === apt._id}
                  >
                    ✓ Complete
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancelAppointment(apt._id)}
                    disabled={actionLoading === apt._id}
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}

              {apt.rating && (
                <div className="appointment-review">
                  <p className="rating">⭐ {apt.rating}/5</p>
                  <p className="review">{apt.review}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentList;
