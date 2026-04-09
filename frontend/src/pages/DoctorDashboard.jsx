import React, { useContext, useEffect, useState } from 'react';
import SlotToggle from '../components/doctor/SlotToggle';
import AppointmentList from '../components/doctor/AppointmentList';
import ProfileForm from '../components/doctor/ProfileForm';
import Loader from '../components/common/Loader';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import './DoctorDashboard.css';

function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for real-time appointment updates
  useEffect(() => {
    if (socket && doctor) {
      socket.on('appointment:confirmed', (data) => {
        if (data.doctorId === doctor._id) {
          console.log('New appointment confirmed:', data);
          fetchData(); // Refresh appointments
        }
      });

      socket.on('appointment:status-updated', (data) => {
        console.log('Appointment status updated:', data);
        setAppointments(prev =>
          prev.map(apt =>
            apt._id === data.appointmentId
              ? { ...apt, status: data.status }
              : apt
          )
        );
      });

      return () => {
        socket.off('appointment:confirmed');
        socket.off('appointment:status-updated');
      };
    }
  }, [socket, doctor]);

  const fetchData = async () => {
    try {
      // Fetch doctor dashboard data
      const dashboardRes = await api.get(`/doctors/${user.doctorId || user.id}/dashboard`);
      setDoctor(dashboardRes.data.doctor);
      setAppointments(dashboardRes.data.todayAppointments);
      setTodayStats(dashboardRes.data.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback: try fetching doctor profile by user ID
      try {
        const doctorRes = await api.get(`/doctors/user/${user.id}`);
        setDoctor(doctorRes.data);
      } catch (err) {
        console.error('Could not fetch doctor data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (isAvailable) => {
    try {
      if (doctor) {
        const res = await api.patch(`/doctors/${doctor._id}/availability`, { isAvailable });
        setDoctor(res.data.doctor);

        // Emit socket event
        if (socket) {
          socket.emit('doctor:availability-changed', {
            doctorId: doctor._id,
            isAvailable,
            city: 'General',
            specialization: doctor.specialization
          });
        }
      }
    } catch (error) {
      alert('Error toggling availability');
    }
  };

  const handleProfileSave = async (updatedData) => {
    try {
      const res = await api.put(`/doctors/${doctor._id}`, updatedData);
      setDoctor(res.data);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  if (loading) return <Loader />;
  if (!doctor) return <div className="error-message">Doctor profile not found</div>;

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-container">
        <h1>Doctor Dashboard</h1>
        <p className="welcome-text">Welcome back, Dr. {user.name}</p>

        {todayStats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{todayStats.totalAppointments}</h3>
              <p>Total Appointments</p>
            </div>
            <div className="stat-card">
              <h3>{todayStats.pendingAppointments}</h3>
              <p>Pending Today</p>
            </div>
            <div className="stat-card">
              <h3>{todayStats.currentQueueSize}</h3>
              <p>In Queue</p>
            </div>
            <div className="stat-card">
              <h3>{todayStats.rating?.toFixed(1) || '0'}</h3>
              <p>Rating ({todayStats.totalReviews} reviews)</p>
            </div>
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments Today
          </button>
          <button
            className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            Availability
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'appointments' && (
            <AppointmentList appointments={appointments} isDoctor={true} onRefresh={fetchData} />
          )}

          {activeTab === 'availability' && (
            <div className="availability-section">
              {doctor && (
                <>
                  <SlotToggle
                    doctorId={doctor._id}
                    isAvailable={doctor.isAvailable}
                    onToggle={handleToggleAvailability}
                  />
                  <div className="availability-info">
                    <h3>How It Works</h3>
                    <ul>
                      <li>Toggle your availability status to let patients know when you're accepting appointments</li>
                      <li>When you're online, nearby patients searching for your specialty will see you</li>
                      <li>You'll receive real-time notifications when patients book with you</li>
                      <li>Manage your schedule from the Appointments tab</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'profile' && doctor && (
            <ProfileForm doctor={doctor} onSave={handleProfileSave} />
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
