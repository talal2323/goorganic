// utils/sendEmail.js

import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Create a transporter (the service that will send the email)
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Using Gmail as the service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your special App Password
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'GoOrganic <noreply@goorganic.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;