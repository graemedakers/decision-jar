
import { Resend } from 'resend';

// Helper to get a safe Resend instance
function getResend() {
  // Falls back to a dummy key to prevent build-time crashes
  const apiKey = process.env.RESEND_API_KEY || 're_123';
  return new Resend(apiKey);
}

export async function sendVerificationEmail(email: string, token: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping email verification.");
    console.log(`Verification Token for ${email}: ${token}`);
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spinthejar.com';
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
  const resend = getResend();

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Decision Jar <hello@spinthejar.com>',
      to: email,
      subject: 'Verify your email for Decision Jar',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to Decision Jar!</h1>
          <p>Please click the button below to verify your email address and activate your account.</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Verify Email</a>
          <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>If you didn't create an account, you can ignore this email.</p>
        </div>
      `
    });
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // We don't throw here to avoid failing the whole signup process if email fails
  }
}

export async function sendDateNotificationEmail(recipients: string[], idea: any) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping date notification email.");
    return;
  }

  const resend = getResend();

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Decision Jar <onboarding@resend.dev>',
      to: recipients,
      subject: `Decision Made: ${idea.description}!`,
      html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ec4899;">It's Decided!</h1>
            <p>The jar has spoken. Your plan for tonight is:</p>
            <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h2 style="margin: 0; color: #be185d;">${idea.description}</h2>
              <p style="margin: 10px 0 0; color: #6b7280;">
                ${idea.indoor ? '🏠 Indoor' : '🌳 Outdoor'} • 
                ${idea.duration}h • 
                ${idea.cost}
              </p>
            </div>
            <p>Have a wonderful time!</p>
          </div>
        `
    });
  } catch (emailError) {
    console.error('Failed to send email:', emailError);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping password reset email.");
    console.log(`Password Reset Token for ${email}: ${token}`);
    return;
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const resend = getResend();

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Decision Jar <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your password for Decision Jar',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Reset Your Password</h1>
          <p>You requested to reset your password. Click the link below to verify your email and set a new password.</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}
