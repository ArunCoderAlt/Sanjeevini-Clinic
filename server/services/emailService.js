const nodemailer = require('nodemailer');
const env = require('../config/environment');
const logger = require('../utils/logger');

let transporter = null;

if (env.emailUser && env.emailPass) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.emailUser,
      pass: env.emailPass,
    },
  });
}

const sendEmail = async (options) => {
  if (!transporter || !env.emailPass) {
    logger.info(`Email skipped (EMAIL_PASS not set): "${options.subject}" to ${options.email}`);
    return;
  }

  const mailOptions = {
    from: env.emailUser,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    logger.warn(`Failed to send email: ${err.message}`);
  }
};

module.exports = { sendEmail };
