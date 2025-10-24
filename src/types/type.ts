import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// src/types/index.ts
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoupon {
  _id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  status: "Active" | "Inactive" | "Expired" | "Suspended";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom?: Date;
  validUntil?: Date;
  expiryDate: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: string | IProduct;
  quantity: number;
  price: number;
}

export interface IOrder {
  _id: string;
  user: string | IUser;
  items: IOrderItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  coupon?: string | ICoupon;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
