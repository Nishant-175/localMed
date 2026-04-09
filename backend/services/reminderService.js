const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const smsService = require('./smsService');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Run every minute to check for appointments 30 minutes away
const reminderJob = cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);

    // Find appointments in next 30-35 minutes that haven't had reminders sent
    const appointments = await Appointment.find({
      status: 'confirmed',
      smsSent: false,
      appointmentDate: {
        $gte: new Date(now.toDateString()),
        $lte: new Date(thirtyMinutesLater.toDateString())
      }
    })
      .populate('patientId')
      .populate('doctorId');

    for (const appointment of appointments) {
      const appointmentDateTime = new Date(appointment.appointmentDate);
      const [hours, minutes] = appointment.startTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Check if appointment is 30 minutes away
      const timeUntilAppointment = appointmentDateTime.getTime() - now.getTime();
      if (timeUntilAppointment > 20 * 60000 && timeUntilAppointment < 35 * 60000) {
        // Send reminder
        const patient = appointment.patientId;
        const doctor = appointment.doctorId;
        const doctorUser = await User.findById(doctor.userId);

        if (patient.phone) {
          await smsService.sendAppointmentReminder(
            patient.phone,
            doctorUser.name,
            appointment.startTime
          );

          appointment.smsSent = true;
          await appointment.save();

          console.log(`Reminder sent for appointment ${appointment._id}`);
        }
      }
    }
  } catch (error) {
    console.error('Error in reminder job:', error);
  }
});

// Export job status and stop function
module.exports = {
  startReminders: () => {
    console.log('Appointment reminder cron job started');
    return reminderJob;
  },
  stopReminders: () => {
    reminderJob.stop();
    console.log('Appointment reminder cron job stopped');
  }
};
