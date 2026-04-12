import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async ({ to, token }) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Verify your email</h2>
      <p>Welcome to AURAX. Please verify your email to activate your account.</p>
      <p><a href="${verifyUrl}" target="_blank" rel="noopener noreferrer">Verify Email</a></p>
      <p>If the button doesn't work, use this URL:</p>
      <p>${verifyUrl}</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Verify your AURAX account',
    html,
  });
};
