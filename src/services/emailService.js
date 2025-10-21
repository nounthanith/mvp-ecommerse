const nodemailer = require("nodemailer");
require("dotenv").config();

const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error(
    "Email credentials missing. Set EMAIL_USER and EMAIL_PASS (Gmail App Password) in your .env."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 10,
});

// Async function to send email (for blocking operations)
async function sendMail({ to, subject, text, html }) {
  const from = process.env.FROM_EMAIL || `"Admin" <${EMAIL_USER}>`;
  console.log('📧 [EMAIL] Attempting to send email:', {
    to: to,
    subject: subject,
    from: from,
    timestamp: new Date().toISOString()
  });
  
  try {
    const result = await transporter.sendMail({ from, to, subject, text, html });
    console.log('✅ [EMAIL] Email sent successfully:', {
      to: to,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });
    return result;
  } catch (error) {
    console.error('❌ [EMAIL] Email sending failed:', {
      to: to,
      subject: subject,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// Non-blocking email sending function for better performance
function sendMailAsync({ to, subject, text, html }) {
  console.log('📧 [EMAIL] Scheduling async email send:', {
    to: to,
    subject: subject,
    timestamp: new Date().toISOString()
  });
  
  setImmediate(() => {
    sendMail({ to, subject, text, html }).catch(error => {
      console.error('❌ [EMAIL] Async email sending failed:', {
        to: to,
        subject: subject,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  });
}

module.exports = { sendMail, sendMailAsync };
