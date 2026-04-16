import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, name: string) => {
  await resend.emails.send({
    from: "AVANTAE <onboarding@resend.dev>",
    to: email,
    subject: "Verify your AVANTAE account",
    html: `
      <h2>Welcome ${name}</h2>
      <p>Please verify your account to continue.</p>
    `,
  });
};
