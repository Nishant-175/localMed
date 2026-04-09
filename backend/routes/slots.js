const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Slot = require('../models/Slot');
const Doctor = require('../models/Doctor');
const router = express.Router();

// Get available slots for a doctor on specific date
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const slots = await Slot.find({
      doctorId: req.params.doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'available'
    }).sort({ startTime: 1 });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate slots for a doctor (bulk create for a date range)
router.post('/generate', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const { doctorId, startDate, endDate, startTime, endTime, intervalMinutes = 30 } = req.body;

    // Verify doctor owns this slot generation
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const slots = [];
    const currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      // Skip weekends if needed (optional)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        let [startHour, startMin] = startTime.split(':').map(Number);
        let [endHour, endMin] = endTime.split(':').map(Number);

        while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
          const slotStart = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
          startMin += intervalMinutes;
          if (startMin >= 60) {
            startHour += Math.floor(startMin / 60);
            startMin = startMin % 60;
          }
          const slotEnd = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;

          slots.push({
            doctorId,
            date: new Date(currentDate),
            startTime: slotStart,
            endTime: slotEnd,
            status: 'available'
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const createdSlots = await Slot.insertMany(slots);
    res.status(201).json({ count: createdSlots.length, slots: createdSlots });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Block/unblock a slot (doctor only)
router.post('/:slotId/block', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.slotId).populate('doctorId');

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot.doctorId.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    slot.status = 'blocked';
    await slot.save();

    res.json({ message: 'Slot blocked successfully', slot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unblock a slot
router.put('/:slotId/unblock', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.slotId).populate('doctorId');

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot.doctorId.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    slot.status = 'available';
    slot.bookedBy = null;
    slot.appointmentId = null;
    await slot.save();

    res.json({ message: 'Slot unblocked successfully', slot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
