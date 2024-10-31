import nodemailer from 'nodemailer';
export const transporter = nodemailer.createTransport({

    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  }, (error, info) => {
    if (error) {
        return console.error('Error sending email:', error);
    }
    console.log('Email sent:', info.response);
});