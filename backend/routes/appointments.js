const express = require('express');
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const smsService = require('../services/smsService');
const router = express.Router();

// Get user's appointments
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [
        { patientId: req.user.id },
        { doctorId: req.user.id }
      ]
    })
      .populate('patientId', 'name phone email')
      .populate('doctorId', 'name specialization')
      .populate('slotId')
      .sort({ appointmentDate: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific appointment
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name phone email')
      .populate('doctorId', 'name specialization')
      .populate('slotId');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book appointment (patient only)
router.post('/book', auth, async (req, res) => {
  try {
    const { doctorId, slotId, urgency, symptoms, reason } = req.body;

    // Check slot availability
    const slot = await Slot.findById(slotId);
    if (!slot || slot.status !== 'available') {
      return res.status(400).json({ error: 'Slot not available' });
    }

    // Get doctor and patient info
    const doctor = await Doctor.findById(doctorId);
    const patient = await User.findById(req.user.id);

    if (!doctor || !patient) {
      return res.status(404).json({ error: 'Doctor or patient not found' });
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      slotId,
      appointmentDate: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      urgency: urgency || 'routine',
      symptoms,
      reason,
      status: 'confirmed'
    });

    await appointment.save();

    // Update slot status
    slot.status = 'booked';
    slot.bookedBy = req.user.id;
    slot.appointmentId = appointment._id;
    await slot.save();

    // Update doctor's queue size
    doctor.currentQueueSize = (doctor.currentQueueSize || 0) + 1;
    await doctor.save();

    // Send SMS notification
    if (patient.phone && doctor.userId) {
      const doctorUser = await User.findById(doctor.userId);
      await smsService.sendAppointmentConfirmation(
        patient.phone,
        `Your appointment with Dr. ${doctorUser.name} is confirmed on ${slot.date.toDateString()} at ${slot.startTime}`
      );

      appointment.smsSent = true;
      await appointment.save();
    }

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cancel appointment
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify authorization
    if (
      req.user.id !== appointment.patientId.toString() &&
      req.user.id !== appointment.doctorId.toString()
    ) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Already cancelled' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Release slot
    const slot = await Slot.findById(appointment.slotId);
    if (slot) {
      slot.status = 'available';
      slot.bookedBy = null;
      slot.appointmentId = null;
      await slot.save();
    }

    // Decrease doctor's queue size
    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor && doctor.currentQueueSize > 0) {
      doctor.currentQueueSize -= 1;
      await doctor.save();
    }

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark appointment as completed (doctor only)
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctorId');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.doctorId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    appointment.status = 'completed';
    await appointment.save();

    res.json({ message: 'Appointment marked complete', appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add review and rating (patient only, after appointment)
router.patch('/:id/review', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed appointments' });
    }

    appointment.rating = rating;
    appointment.review = review;
    await appointment.save();

    // Update doctor's rating
    const doctor = await Doctor.findById(appointment.doctorId);
    const allReviews = await Appointment.find({
      doctorId: appointment.doctorId,
      rating: { $exists: true, $ne: null },
      status: 'completed'
    });

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, apt) => sum + (apt.rating || 0), 0) / allReviews.length;
      doctor.rating = parseFloat(avgRating.toFixed(2));
      doctor.totalReviews = allReviews.length;
      await doctor.save();
    }

    res.json({ message: 'Review added', appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
