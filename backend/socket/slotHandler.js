const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // Join geographic + specialty room (e.g., 'Mumbai-Cardiology')
    socket.on('join:geoRoom', async (data) => {
      try {
        const { city, specialization } = data;
        const roomName = `${city}-${specialization}`;

        socket.join(roomName);
        console.log(`Socket ${socket.id} joined room: ${roomName}`);

        socket.emit('room:joined', { room: roomName, message: 'Successfully joined' });
      } catch (error) {
        console.error('Error in join:geoRoom:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave geographic + specialty room
    socket.on('leave:geoRoom', async (data) => {
      try {
        const { city, specialization } = data;
        const roomName = `${city}-${specialization}`;

        socket.leave(roomName);
        console.log(`Socket ${socket.id} left room: ${roomName}`);
      } catch (error) {
        console.error('Error in leave:geoRoom:', error);
      }
    });

    // Doctor availability changed
    socket.on('doctor:availability-changed', async (data) => {
      try {
        const { doctorId, isAvailable, city, specialization } = data;
        const doctor = await Doctor.findById(doctorId);

        if (doctor) {
          doctor.isAvailable = isAvailable;
          await doctor.save();

          const roomName = `${city}-${specialization}`;
          io.to(roomName).emit('doctor:availability-changed', {
            doctorId,
            isAvailable,
            doctorName: doctor.clinicName || 'Doctor',
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error in doctor:availability-changed:', error);
      }
    });

    // Slot booked event
    socket.on('slot:booked', async (data) => {
      try {
        const { slotId, doctorId, city, specialization, patientName } = data;
        const roomName = `${city}-${specialization}`;

        io.to(roomName).emit('slot:booked', {
          slotId,
          doctorId,
          patientName,
          timestamp: new Date(),
          message: `New appointment booked`
        });
      } catch (error) {
        console.error('Error in slot:booked:', error);
      }
    });

    // Slot released event
    socket.on('slot:released', async (data) => {
      try {
        const { slotId, doctorId, city, specialization } = data;
        const roomName = `${city}-${specialization}`;

        io.to(roomName).emit('slot:released', {
          slotId,
          doctorId,
          timestamp: new Date(),
          message: 'Slot is now available'
        });
      } catch (error) {
        console.error('Error in slot:released:', error);
      }
    });

    // Appointment confirmed event
    socket.on('appointment:confirmed', async (data) => {
      try {
        const { appointmentId, patientId, doctorId, city, specialization } = data;
        const roomName = `${city}-${specialization}`;

        io.to(roomName).emit('appointment:confirmed', {
          appointmentId,
          patientId,
          doctorId,
          timestamp: new Date(),
          message: 'Appointment confirmed'
        });

        // Also notify doctor directly
        io.to(`doctor:${doctorId}`).emit('appointment:confirmed', {
          appointmentId,
          patientId,
          doctorId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error in appointment:confirmed:', error);
      }
    });

    // Doctor going online (private room for doctor notifications)
    socket.on('doctor:online', async (doctorId) => {
      try {
        const doctor = await Doctor.findById(doctorId);
        if (doctor) {
          doctor.isAvailable = true;
          await doctor.save();

          socket.join(`doctor:${doctorId}`);
          socket.emit('doctor:online-confirmed', { doctorId, isAvailable: true });
        }
      } catch (error) {
        console.error('Error in doctor:online:', error);
      }
    });

    // Doctor going offline
    socket.on('doctor:offline', async (doctorId) => {
      try {
        const doctor = await Doctor.findById(doctorId);
        if (doctor) {
          doctor.isAvailable = false;
          await doctor.save();

          socket.leave(`doctor:${doctorId}`);
          socket.emit('doctor:offline-confirmed', { doctorId, isAvailable: false });
        }
      } catch (error) {
        console.error('Error in doctor:offline:', error);
      }
    });

    // Appointment status update notification
    socket.on('appointment:status-update', async (data) => {
      try {
        const { appointmentId, status, doctorId, patientId } = data;

        // Notify both doctor and patient
        io.to(`doctor:${doctorId}`).emit('appointment:status-updated', {
          appointmentId,
          status,
          timestamp: new Date()
        });

        io.to(`patient:${patientId}`).emit('appointment:status-updated', {
          appointmentId,
          status,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error in appointment:status-update:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

