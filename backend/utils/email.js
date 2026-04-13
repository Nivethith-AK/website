import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const canSendEmail = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const sendHtmlEmail = async ({ to, subject, html }) => {
  if (!canSendEmail()) {
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

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

  await sendHtmlEmail({
    to,
    subject: 'Verify your AURAX account',
    html,
  });
};

export const sendApprovalStatusEmail = async ({ to, name, approved, role, rejectionReason }) => {
  const roleLabel = role === 'company' ? 'company account' : `${role} account`;
  const subject = approved ? 'Your AURAX account has been approved' : 'Your AURAX account update';

  const html = approved
    ? `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Account Approved</h2>
        <p>Hello ${name || 'there'},</p>
        <p>Your ${roleLabel} has been approved by the AURAX admin team.</p>
        <p>You can now sign in and start using your dashboard.</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Account Not Approved</h2>
        <p>Hello ${name || 'there'},</p>
        <p>Your ${roleLabel} was not approved at this time.</p>
        ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
        <p>Please update your profile details and contact support if needed.</p>
      </div>
    `;

  await sendHtmlEmail({ to, subject, html });
};

export const sendRequestStatusEmail = async ({ to, companyName, projectTitle, approved, rejectionReason }) => {
  const subject = approved ? 'Your project request was approved' : 'Your project request update';

  const html = approved
    ? `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Request Approved</h2>
        <p>Hello ${companyName || 'team'},</p>
        <p>Your request for <strong>${projectTitle}</strong> has been approved by the admin team.</p>
        <p>You can now continue to assignment and project execution steps.</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Request Rejected</h2>
        <p>Hello ${companyName || 'team'},</p>
        <p>Your request for <strong>${projectTitle}</strong> was rejected by the admin team.</p>
        ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
        <p>Please update and resubmit when ready.</p>
      </div>
    `;

  await sendHtmlEmail({ to, subject, html });
};
