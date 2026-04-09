import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import './SlotToggle.css';

function SlotToggle({ doctorId, isAvailable, onToggle }) {
  const { socket } = useContext(SocketContext);

  const handleToggle = () => {
    onToggle(!isAvailable);
    if (socket) {
      socket.emit('doctor:' + (!isAvailable ? 'online' : 'offline'), doctorId);
    }
  };

  return (
    <div className="slot-toggle">
      <div className="toggle-container">
        <span className="toggle-label">Your Availability Status</span>
        <button
          className={`toggle-btn ${isAvailable ? 'active' : ''}`}
          onClick={handleToggle}
        >
          <div className="toggle-circle"></div>
        </button>
        <span className={`status-text ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? '● Online (Accepting Patients)' : '● Offline (Not Accepting)'}
        </span>
      </div>
    </div>
  );
}

export default SlotToggle;
