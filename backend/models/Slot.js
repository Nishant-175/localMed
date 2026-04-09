const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // Format: HH:MM
    required: true
  },
  endTime: {
    type: String, // Format: HH:MM
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked'],
    default: 'available'
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient querying by doctor and date
slotSchema.index({ doctorId: 1, date: 1 });

module.exports = mongoose.model('Slot', slotSchema);
