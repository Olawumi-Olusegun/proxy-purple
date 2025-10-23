import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";
import { AuthRequest } from "../types/type";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const myProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const UpdateMyProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      country,
      city,
      addressLine1,
      addressLine2,
      postalCode,
    } = req.body;

    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.phoneNumber = phoneNumber ?? user.phoneNumber;
    user.country = country ?? user.country;
    user.city = city ?? user.city;
    user.addressLine1 = addressLine1 ?? user.addressLine1;
    user.addressLine2 = addressLine2 ?? user.addressLine2;
    user.postalCode = postalCode ?? user.postalCode;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
        city: user.city,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        postalCode: user.postalCode,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
