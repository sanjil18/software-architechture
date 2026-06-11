backend/src/services/smsService.js
const twilio = require('twilio');

const sendSMS = async (to, message) => {
  try {
    if (process.env.NODE_ENV === 'development' || !process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      console.log(`📱 [SMS MOCK] To: ${to}`);
      console.log(`📱 [SMS MOCK] Message: ${message}`);
      return { success: true, mock: true };
    }
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const result = await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to });
    console.log(`✅ SMS sent to ${to}: SID=${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`❌ SMS failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendPaymentConfirmationSMS = async (officerPhone, fineDetails) => {
  const message =
    `Sri Lanka Police - Fine Payment Confirmed\n` +
    `Ref: ${fineDetails.referenceNumber}\n` +
    `Driver: ${fineDetails.driverName}\n` +
    `Vehicle: ${fineDetails.vehicleNumber}\n` +
    `Amount: LKR ${fineDetails.amount.toLocaleString()}\n` +
    `Paid at: ${new Date(fineDetails.paidAt).toLocaleString('en-LK')}\n` +
    `Please release the driver's license.`;
  return await sendSMS(officerPhone, message);
};

module.exports = { sendSMS, sendPaymentConfirmationSMS };