const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true,
    enum: [
      'General Practitioner',
      'Cardiologist',
      'Dermatologist',
      'Pediatrician',
      'Orthopedic',
      'Psychiatrist',
      'Neurologist',
      'Gastroenterologist',
      'ENT',
      'Gynecologist',
      'Urologist',
      'Oncologist',
      'Dentist',
      'Physiotherapist',
      'Other'
    ]
  },
  qualifications: {
    type: [String],
    required: true,
    default: []
  },
  experience: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  consultationFee: {
    type: Number,
    required: true,
    default: 500,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: false
  },
  currentQueueSize: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  address: {
    type: String,
    default: ''
  },
  clinicName: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Additional fields for backward compatibility
  clinic: {
    name: String,
    address: String,
    latitude: Number,
    longitude: Number
  },
  availableSlots: [{
    startTime: Date,
    endTime: Date,
    isBooked: Boolean
  }],
  totalAppointments: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
doctorSchema.index({ location: '2dsphere' });

// Sync legacy clinic location to GeoJSON location when saving
doctorSchema.pre('save', function(next) {
  if (this.clinic && this.clinic.latitude && this.clinic.longitude) {
    this.location = {
      type: 'Point',
      coordinates: [this.clinic.longitude, this.clinic.latitude]
    };
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);
