import React, { useState, useEffect } from 'react';
import SearchBar from '../components/patient/SearchBar';
import DoctorCard from '../components/patient/DoctorCard';
import BookingModal from '../components/patient/BookingModal';
import MapView from '../components/patient/MapView';
import Loader from '../components/common/Loader';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSearch } from '../hooks/useSearch';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import './Search.css';

function Search() {
  const { location, getLocation } = useGeolocation();
  const { doctors, setDoctors, loading, searchDoctors } = useSearch();
  const socket = useSocket();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentCity, setCurrentCity] = useState(null);
  const [currentSpecialty, setCurrentSpecialty] = useState(null);

  // Join geo-room when location and specialty are available
  useEffect(() => {
    if (socket && currentCity && currentSpecialty) {
      socket.emit('join:geoRoom', {
        city: currentCity,
        specialization: currentSpecialty
      });

      console.log(`Joined room: ${currentCity}-${currentSpecialty}`);

      // Listen for real-time doctor availability changes
      socket.on('doctor:availability-changed', (data) => {
        setDoctors(prev =>
          prev.map(doc =>
            doc._id === data.doctorId
              ? { ...doc, isAvailable: data.isAvailable }
              : doc
          )
        );
      });

      // Listen for slot releases
      socket.on('slot:released', (data) => {
        console.log('Slot released:', data);
        // Could trigger UI refresh here
      });

      // Listen for slot bookings
      socket.on('slot:booked', (data) => {
        console.log('Slot booked by:', data.patientName);
      });

      return () => {
        // Clean up: leave room on unmount or when room changes
        socket.emit('leave:geoRoom', {
          city: currentCity,
          specialization: currentSpecialty
        });

        socket.off('doctor:availability-changed');
        socket.off('slot:released');
        socket.off('slot:booked');
      };
    }
  }, [socket, currentCity, currentSpecialty, setDoctors]);

  const handleSearch = async (searchParams) => {
    const params = {
      ...searchParams,
      ...(location && {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 5 // 5km search radius
      })
    };

    // Track city and specialty for geo-rooms
    if (location && searchParams.specialization) {
      // For now, use a generic city (in production, use reverse geocoding)
      setCurrentCity('General');
      setCurrentSpecialty(searchParams.specialization);
    }

    await searchDoctors(params);
  };

  const handleBooking = async (bookingData) => {
    try {
      const response = await api.post('/appointments/book', bookingData);
      alert('Appointment booked successfully!');

      // Emit socket event to notify others
      if (socket && selectedDoctor) {
        socket.emit('slot:booked', {
          slotId: bookingData.slotId,
          doctorId: selectedDoctor._id,
          city: currentCity,
          specialization: currentSpecialty,
          patientName: 'Patient'
        });
      }

      setShowBookingModal(false);
      setSelectedDoctor(null);

      // Refresh doctors list
      const currentSearchParams = new URLSearchParams(window.location.search);
      handleSearch(Object.fromEntries(currentSearchParams));
    } catch (error) {
      alert('Booking failed: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h1>Find a Doctor</h1>

        <button className="location-btn" onClick={getLocation}>
          📍 Use My Location
        </button>

        <SearchBar onSearch={handleSearch} />

        {loading ? (
          <Loader />
        ) : (
          <>
            {location && doctors.length > 0 && (
              <MapView doctors={doctors} userLocation={[location.latitude, location.longitude]} />
            )}

            <div className="results">
              <h2>Available Doctors ({doctors.length})</h2>
              {doctors.length === 0 ? (
                <p className="no-results">No doctors found. Try adjusting your search.</p>
              ) : (
                <div className="doctors-list">
                  {doctors.map(doctor => (
                    <DoctorCard
                      key={doctor._id}
                      doctor={doctor}
                      onBook={(doc) => {
                        setSelectedDoctor(doc);
                        setShowBookingModal(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onConfirm={handleBooking}
        />
      )}
    </div>
  );
}

export default Search;
