import { Resend } from "resend";

export const sendVerificationEmail = async (email: string, name: string) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const resend = new Resend(apiKey);
  const adminEmail = process.env.ADMIN_EMAIL || "noreply@avantae.com";

  await resend.emails.send({
    from: adminEmail,
    to: email,
    subject: "Verify your AVANTAE account",
    html: `
      <h2>Welcome ${name}</h2>
      <p>Please verify your account to continue.</p>
      <p>Thank you for joining AVANTAE!</p>
    `,
  });
};
