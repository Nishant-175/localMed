import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './MapView.css';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapView({ doctors, userLocation }) {
  const defaultCenter = userLocation || [51.505, -0.09];

  return (
    <div className="map-container">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* User location */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Doctor locations */}
        {doctors.map(doctor => (
          doctor.clinic && (
            <Marker
              key={doctor._id}
              position={[doctor.clinic.latitude, doctor.clinic.longitude]}
            >
              <Popup>
                <div className="popup-content">
                  <p><strong>Dr. {doctor.userId?.name}</strong></p>
                  <p>{doctor.specialty}</p>
                  <p>{doctor.clinic.name}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
