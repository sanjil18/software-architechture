const twilio = require('twilio');

// Sri Lankan numbers are typically entered in local format (0771234567).
// Twilio requires E.164 (+94771234567) for both the sender and recipient.
const toE164 = (phone) => {
  if (!phone) return phone;
  const digits = phone.replace(/[\s-]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('0')) return `+94${digits.slice(1)}`;
  return `+94${digits}`;
};

const isTwilioConfigured = () =>
  !!process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC');

const sendSMS = async (to, message) => {
  const recipient = toE164(to);

  try {
    // Without real Twilio credentials configured, just log the SMS
    if (!isTwilioConfigured()) {
      console.log(`📱 [SMS MOCK] To: ${recipient}`);
      console.log(`📱 [SMS MOCK] Message: ${message}`);
      return { success: true, mock: true };
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipient,
    });

    console.log(`✅ SMS sent to ${recipient}: SID=${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`❌ SMS failed to ${recipient}:`, error.message);
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

const sendFineIssuedSMS = async (driverPhone, fineDetails) => {
  const message =
    `Sri Lanka Police - Traffic Fine Issued\n` +
    `Ref: ${fineDetails.referenceNumber}\n` +
    `Violation: ${fineDetails.violation}\n` +
    `Vehicle: ${fineDetails.vehicleNumber}\n` +
    `Amount: LKR ${fineDetails.amount.toLocaleString()}\n` +
    `Location: ${fineDetails.location}\n` +
    `Due Date: ${new Date(fineDetails.dueDate).toLocaleDateString('en-LK')}\n` +
    `Pay online using Ref ${fineDetails.referenceNumber} and Category ${fineDetails.categoryId}.`;

  return await sendSMS(driverPhone, message);
};

const sendDriverPaymentConfirmationSMS = async (driverPhone, fineDetails) => {
  const message =
    `Sri Lanka Police - Payment Confirmed\n` +
    `Ref: ${fineDetails.referenceNumber}\n` +
    `Amount Paid: LKR ${fineDetails.amount.toLocaleString()}\n` +
    `Paid at: ${new Date(fineDetails.paidAt).toLocaleString('en-LK')}\n` +
    `Thank you. Please collect your license from the issuing officer.`;

  return await sendSMS(driverPhone, message);
};

module.exports = {
  sendSMS,
  sendFineIssuedSMS,
  sendPaymentConfirmationSMS,
  sendDriverPaymentConfirmationSMS,
};
