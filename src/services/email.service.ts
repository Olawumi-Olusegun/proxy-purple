import nodemailer from "nodemailer";
import config from "../config";

function validateEmailConfig() {
  if (!config.email.user?.trim()) {
    throw new Error("EMAIL_USER is not defined in config");
  }

  if (!config.email.pass?.trim()) {
    throw new Error("EMAIL_PASS is not defined in config");
  }

  if (!config.email.host?.trim()) {
    throw new Error("EMAIL_PASS is not defined in config");
  }

  // Trim and validate email format
  const email = config.email.user.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error(`Invalid email format in config: "${email}"`);
  }

  return {
    user: email,
    pass: config.email.pass,
    host: config.email.host,
  };
}

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
  });
}

export async function sendResetPasswordEmail(to: string, token: string) {
  const resetUrl = `${
    config.clientUrl
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
  const { user, pass, host } = validateEmailConfig();

  const transporter = nodemailer.createTransport({
    host,
    port: 587,
    secure: false,
    auth: {
      user,
      pass,
    },
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

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
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
