const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendAppointmentConfirmation(phoneNumber, doctorName, appointmentTime) {
    try {
      await this.client.messages.create({
        body: `Your appointment with Dr. ${doctorName} is confirmed for ${appointmentTime}. Reply CONFIRM to confirm or CANCEL to cancel.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
    } catch (error) {
      console.error('SMS send error:', error);
    }
  }

  async sendSlotAvailabilityAlert(phoneNumber, doctorName, specialty) {
    try {
      await this.client.messages.create({
        body: `Dr. ${doctorName} (${specialty}) is now available. Click to book: [link]`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
    } catch (error) {
      console.error('SMS send error:', error);
    }
  }
}

module.exports = new SMSService();
