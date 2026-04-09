import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './BookingModal.css';

function BookingModal({ doctor, isOpen, onClose, onConfirm }) {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [urgency, setUrgency] = useState('routine');
  const [symptoms, setSymptoms] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch available slots when date changes
  useEffect(() => {
    if (date && doctor._id) {
      fetchSlots(date);
    }
  }, [date, doctor._id]);

  const fetchSlots = async (selectedDate) => {
    try {
      setLoading(true);
      const response = await api.get(`/slots/doctor/${doctor._id}?date=${selectedDate}`);
      setSlots(response.data);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!date || !selectedSlot || !reason) {
      alert('Please fill in all fields and select a slot');
      return;
    }

    onConfirm({
      doctorId: doctor._id,
      slotId: selectedSlot._id,
      appointmentDate: date,
      urgency,
      symptoms,
      reason
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Book Appointment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="doctor-summary">
            <p><strong>Dr. {doctor.userId?.name}</strong></p>
            <p>{doctor.specialization}</p>
            <p>₹{doctor.consultationFee} Consultation Fee</p>
          </div>

          <div className="form-group">
            <label>Preferred Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {date && (
            <div className="form-group">
              <label>Available Slots</label>
              {loading ? (
                <p>Loading available slots...</p>
              ) : slots.length > 0 ? (
                <div className="slots-grid">
                  {slots.map(slot => (
                    <button
                      key={slot._id}
                      className={`slot-btn ${selectedSlot?._id === slot._id ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot.startTime} - {slot.endTime}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-slots">No available slots for this date</p>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Urgency Level</label>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="form-group">
            <label>Symptoms/Description</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe your symptoms..."
              rows="3"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Reason for Visit</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you visiting the doctor?"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button 
            className="confirm-btn" 
            onClick={handleSubmit}
            disabled={!selectedSlot || loading}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
