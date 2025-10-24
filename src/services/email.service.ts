import nodemailer from "nodemailer";
import config from "../config";
import { Resend } from "resend";
import { HttpError } from "../utils/http-error";

const resend = new Resend(config.RESEND_EMAIL_API_KEY);

function validateEmailConfig() {
  if (!config.email.EMAIL_USER?.trim()) {
    throw new Error("EMAIL_USER is not defined in config");
  }

  if (!config.email.EMAIL_PASS?.trim()) {
    throw new Error("EMAIL_PASS is not defined in config");
  }

  if (!config.email.SMTP_HOST?.trim()) {
    throw new Error("EMAIL_PASS is not defined in config");
  }

  // Trim and validate email format
  const email = config.email.EMAIL_USER.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error(`Invalid email format in config: "${email}"`);
  }

  return {
    user: email,
    pass: config.email.EMAIL_PASS,
    host: config.email.SMTP_HOST,
  };
}

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email.EMAIL_USER,
      pass: config.email.EMAIL_PASS,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
  });
}

export async function sendResetPasswordEmail(to: string, token: string) {
  const resetUrl = `${
    config.CLIENT_URL
  }/reset-password?token=${encodeURIComponent(token)}`;
  // await transporter.sendMail({
  //   from: config.email.user,
  //   to,
  //   subject: "Reset your password",
  //   text: `Reset your password: ${resetUrl}`,
  //   html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
  // });
}

export async function sendOtpEmail(to: string, otp: string) {
  const { user, pass } = validateEmailConfig();

  if (!to) {
    throw new Error("User's email address required");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false, // Allows unverified SSL certificates
    },
    debug: config.IS_DEVELOPMENT,
  });

  try {
    const mailOptions = {
      from: `"ProxyPurple" <${user}>`,
      to: to,
      subject: "Your OTP Code",
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family:Arial, sans-serif;line-height:1.5">
          <h2>Verify your email</h2>
          <p>Your one-time password (OTP) is:</p>
          <h1 style="letter-spacing:4px">${otp}</h1>
          <p>This code expires in 10 minutes. Please do not share it with anyone.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    throw error;
  } finally {
    transporter.close();
  }
}

export async function sendResetPasswordOtp(to: string, otp: string) {
  const { user, pass } = validateEmailConfig();

  if (!to) {
    throw new HttpError("User's email address required", 404);
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false, // Allows unverified SSL certificates
    },
    debug: config.IS_DEVELOPMENT,
  });

  const mailOptions = {
    from: `"ProxyPurple" <${user}>`,
    to,
    subject: "Reset Password OTP",
    text: `Your reset password OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial, sans-serif;line-height:1.5">
        <h2>Reset Password Request</h2>
        <p>Your one-time password (OTP) is:</p>
        <h1 style="letter-spacing:4px">${otp}</h1>
        <p>This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw error;
  } finally {
    transporter.close();
  }
}

export async function sendOtpEmailWithResend(to: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "ProxyPurple <onboarding@resend.dev>",
      to,
      subject: "Your OTP Code",
      html: `
        <div style="font-family:Arial, sans-serif;line-height:1.5">
          <h2>Verify your email</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:4px">${otp}</h1>
          <p>It expires in 10 minutes. Don't share it.</p>
        </div>
      `,
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Email send failed:", err);
    throw new Error("Email sending failed");
  }
}
