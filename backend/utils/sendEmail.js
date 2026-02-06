import nodemailer from 'nodemailer';

const sendEmail = async (options) => {

  // 1. We use specific Host and Port instead of 'service: Gmail'
  // 2. Port 587 is the standard for cloud servers (like Render) to talk to Gmail
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // This helps prevent connection errors on some cloud providers
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: 'GOorganic <noreply@goorganic.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || undefined,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;