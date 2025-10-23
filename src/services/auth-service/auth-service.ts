import { User } from "../../models/user.model";
import { hashToken } from "../../utils/crypto.util";
import { StringValue } from "ms";
import jwt from "jsonwebtoken";
import { AuthToken } from "../../models/auth-token.model";
import { verifyGoogleIdToken } from "../google.service";
import OtpModel from "../../models/otp.model";
import { sendOtpEmail } from "../email.service";
import { generateAlphaNumericOTP } from "../../utils/generateOTP";
import { HttpError } from "../../utils/http-error";

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;
  private readonly jwtBycryptRounds: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "secret";
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "refreshSecret";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    this.jwtBycryptRounds = parseInt(process.env.JWT_BYCRPYT_ROUNDS || "10");

    if (!this.jwtSecret || !this.jwtRefreshSecret) {
      throw new Error("JWT_SECRET are not defined in environmental file");
    }
  }

  // async signup(email: string, password: string) {
  //   const existing = await User.findOne({ email });
  //   if (existing) {
  //     throw new HttpError("Email already in use", 400);
  //   }

  //   let newUser;

  //   try {
  //     newUser = await User.create({ email, password });
  //     await this.createAndSendOtp(email);
  //   } catch (error) {
  //     await User.deleteOne({ email });
  //     await OtpModel.deleteMany({ email });
  //     throw new HttpError("Failed to create user", 500);
  //   }

  //   return { newUser };
  // }

  async signup(email: string, password: string) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new HttpError("Email already in use", 400);
    }

    try {
      // Create OTP before creating user in database
      const otpRecord = await this.createOtpRecord(email);

      // Try sending OTP email before user creation
      await sendOtpEmail(email, otpRecord.otp);

      // Only create user AFTER successful email sending
      const newUser = await User.create({
        email,
        password,
        isVerified: false,
      });

      return { newUser };
    } catch (error) {
      //Rollback OTP if email sending fails
      await OtpModel.deleteMany({ email });
      throw new HttpError("Failed to send OTP email. Please try again.", 500);
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      const otpRecord = await OtpModel.findOne({ email });

      if (!otpRecord) {
        throw new HttpError("OTP not found for this email", 404);
      }

      // Delete OTP if it has expired
      if (otpRecord.expiresAt < new Date()) {
        await OtpModel.deleteMany({ email });
        throw new HttpError("OTP has expired", 400);
      }

      const isMatch = await otpRecord.isValid(otp);
      if (!isMatch) {
        throw new HttpError("Invalid OTP", 400);
      }

      // Mark user as verified
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { isVerified: true },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        throw new HttpError("User not found", 404);
      }

      // Delete all OTPs for this user (cleanup)
      await OtpModel.deleteMany({ email });

      const { accessToken, refreshToken } = await this.generateToken(
        updatedUser._id,
        updatedUser.email
      );
      return {
        user: updatedUser,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyForgotPasswordOtp(email: string, otp: string) {
    try {
      const otpRecord = await OtpModel.findOne({ email });

      if (!otpRecord) {
        throw new HttpError("OTP not found for this email", 404);
      }

      // Delete OTP if it has expired
      if (otpRecord.expiresAt < new Date()) {
        await OtpModel.deleteMany({ email });
        throw new HttpError("OTP has expired", 400);
      }

      const isMatch = await otpRecord.isValid(otp);
      if (!isMatch) {
        throw new HttpError("Invalid OTP", 400);
      }
      return { ok: true };
    } catch (error) {
      throw error;
    }
  }

  async signin(email: string, password: string) {
    const userExist = await User.findOne({ email });

    if (!userExist) {
      throw new HttpError("Invalid credentials", 401);
    }

    if (!userExist.isVerified) {
      throw new HttpError("You account is not verified", 401);
    }

    const isValidPassword = await userExist.comparePassword(password);
    if (!isValidPassword) {
      throw new HttpError("Invalid credentials", 401);
    }

    const { accessToken, refreshToken } = await this.generateToken(
      userExist.id,
      userExist.email
    );

    return {
      userExist,
      accessToken,
      refreshToken,
    };
  }

  /* ============ REFRESH TOKEN ============ */
  async refreshToken(oldRefreshToken: string) {
    if (!oldRefreshToken) throw new Error("No refresh token provided");

    let payload: any;
    try {
      payload = jwt.verify(oldRefreshToken, this.jwtRefreshSecret);
    } catch {
      throw new HttpError("Invalid refresh token", 401);
    }

    const existing = await AuthToken.findOne({
      userId: payload.userId,
      token: hashToken(oldRefreshToken),
    });

    if (!existing) {
      throw new HttpError("Refresh token not recognized or expired", 401);
    }

    const user = await User.findById(payload.userId);
    if (!user) throw new HttpError("User not found", 404);

    // Rotate tokens
    const { accessToken, refreshToken } = await this.generateToken(
      user.id,
      user.email
    );

    // Delete old token (rotation)
    await AuthToken.deleteOne({ _id: existing._id });

    return {
      accessToken,
      refreshToken,
    };
  }

  /* ============ GOOGLE AUTH ============ */
  async googleAuth(idToken: string) {
    if (!idToken) throw new HttpError("No Google ID token provided", 400);

    const payload: any = await verifyGoogleIdToken(idToken);
    const email = payload.email;
    const googleId = payload.userId;
    const name = payload.name;

    let userExist = await User.findOne({ email });

    if (!userExist) {
      userExist = await User.create({
        email,
        name,
        googleId,
        isVerified: true,
      });
    } else if (!userExist.googleId) {
      userExist.googleId = googleId;
      await userExist.save();
    }

    const { accessToken, refreshToken } = await this.generateToken(
      userExist.id,
      userExist.email
    );

    return {
      accessToken,
      refreshToken,
      userExist,
    };
  }

  /* ============ SIGN OUT ============ */
  async signout(refreshToken?: string) {
    if (!refreshToken) {
      return { success: true, message: "No token found, already logged out" };
    }

    try {
      const payload: any = jwt.verify(refreshToken, this.jwtRefreshSecret);

      await AuthToken.deleteOne({
        userId: payload.userId,
        token: refreshToken,
      });

      return { success: true, message: "Logged out successfully" };
    } catch {
      // Invalid or expired token, still clear cookie client-side
      return { success: true, message: "Invalid or expired token cleared" };
    }
  }

  /* ============ RESET PASSWORD ============ */
  async resetPassword(email: string, otp: string, newPassword: string) {
    const otpRecord = await OtpModel.findOne({ email });

    if (!otpRecord) {
      throw new HttpError("OTP not found for this email", 404);
    }

    // Delete OTP if it has expired
    if (otpRecord.expiresAt < new Date()) {
      await OtpModel.deleteMany({ otp });
      throw new HttpError("OTP has expired", 400);
    }

    // Check if OTP is valid
    const isMatch = await otpRecord.isValid(otp);
    if (!isMatch) {
      throw new HttpError("Invalid OTP", 400);
    }

    // Find user using user email in OTP model
    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    await OtpModel.deleteMany({ email });
    user.password = newPassword;
    await user.save();

    const { accessToken, refreshToken } = await this.generateToken(
      user.id,
      user.email
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  private async generateToken(userId: string, email: string) {
    const accessTokenOptions = {
      expiresIn: this.jwtExpiresIn as StringValue,
    };

    const accessToken = jwt.sign(
      { userId, email },
      this.jwtSecret,
      accessTokenOptions
    );

    const refreshTokenOptions = {
      expiresIn: this.jwtRefreshExpiresIn as StringValue,
    };

    const refreshToken = jwt.sign(
      { userId, email },
      this.jwtSecret,
      refreshTokenOptions
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await AuthToken.create({
      userId,
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private async createAndSendOtp(email: string) {
    try {
      await OtpModel.deleteMany({ email });

      const otpCode = generateAlphaNumericOTP();
      await OtpModel.create({
        email,
        otp: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      });

      // Send the OTP via email
      await sendOtpEmail(email, otpCode);
    } catch {
      await User.deleteOne({ email });
      await OtpModel.deleteMany({ email });
      throw new HttpError(`Failed to send OTP email`, 500);
    }
  }

  private async createOtpRecord(email: string) {
    try {
      await OtpModel.deleteMany({ email });

      const otpCode = generateAlphaNumericOTP();
      const otpRecord = await OtpModel.create({
        email,
        otp: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      });

      if (!otpRecord) {
        throw new HttpError(`Failed to create OTP`, 400);
      }

      return otpRecord;
    } catch {
      throw new HttpError(`Failed to create OTP`, 500);
    }
  }
}
