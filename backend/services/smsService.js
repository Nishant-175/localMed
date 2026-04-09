const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

const smsService = {
  // Send appointment confirmation SMS
  async sendAppointmentConfirmation(toNumber, message) {
    try {
      if (!client) {
        console.warn('Twilio not configured. SMS not sent.');
        return { success: false, message: 'Twilio not configured' };
      }

      const result = await client.messages.create({
        body: message,
        from: phoneNumber,
        to: toNumber
      });

      console.log(`SMS sent: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('SMS send error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send appointment reminder (30 minutes before)
  async sendAppointmentReminder(toNumber, doctorName, appointmentTime) {
    try {
      if (!client) {
        console.warn('Twilio not configured. SMS not sent.');
        return { success: false, message: 'Twilio not configured' };
      }

      const message = `Reminder: Your appointment with Dr. ${doctorName} is at ${appointmentTime}. Please arrive 10 minutes early.`;

      const result = await client.messages.create({
        body: message,
        from: phoneNumber,
        to: toNumber
      });

      console.log(`Reminder SMS sent: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('SMS send error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send cancellation notification
  async sendCancellationNotification(toNumber, doctorName) {
    try {
      if (!client) {
        console.warn('Twilio not configured. SMS not sent.');
        return { success: false, message: 'Twilio not configured' };
      }

      const message = `Your appointment with Dr. ${doctorName} has been cancelled. Please contact the clinic for rescheduling.`;

      const result = await client.messages.create({
        body: message,
        from: phoneNumber,
        to: toNumber
      });

      console.log(`Cancellation SMS sent: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('SMS send error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send verification code
  async sendVerificationCode(toNumber, code) {
    try {
      if (!client) {
        console.warn('Twilio not configured. SMS not sent.');
        return { success: false, message: 'Twilio not configured' };
      }

      const message = `Your LocalMed verification code is: ${code}. Valid for 10 minutes.`;

      const result = await client.messages.create({
        body: message,
        from: phoneNumber,
        to: toNumber
      });

      console.log(`Verification SMS sent: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('SMS send error:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = smsService;
