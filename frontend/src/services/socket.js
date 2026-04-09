import io from 'socket.io-client';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5001';

export const socket = io(SERVER_URL, {
  autoConnect: true
});

export const events = {
  // Doctor events
  DOCTOR_ONLINE: 'doctor:online',
  DOCTOR_OFFLINE: 'doctor:offline',
  DOCTOR_AVAILABLE: 'doctor:available',
  DOCTOR_UNAVAILABLE: 'doctor:unavailable',

  // Appointment events
  APPOINTMENT_CREATED: 'appointment:created',
  APPOINTMENT_NEW: 'appointment:new',
  APPOINTMENT_UPDATED: 'appointment:updated',

  // Slot events
  SLOT_UPDATED: 'slot:updated',
  SLOT_CHANGED: 'slot:changed'
};
