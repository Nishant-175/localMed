import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch }) {
  const [specialty, setSpecialty] = useState('');
  const [urgency, setUrgency] = useState('routine');

  const handleSearch = () => {
    onSearch({ specialty, urgency });
  };

  return (
    <div className="search-bar">
      <div className="search-input">
        <label>Specialty</label>
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
          <option value="">Select Specialty</option>
          <option value="General Practitioner">General Practitioner</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Pediatrician">Pediatrician</option>
          <option value="Orthopedic">Orthopedic</option>
        </select>
      </div>

      <div className="search-input">
        <label>Urgency</label>
        <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
          <option value="routine">Routine</option>
          <option value="urgent">Urgent</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <button className="search-btn" onClick={handleSearch}>
        Search Doctors
      </button>
    </div>
  );
}

export default SearchBar;
