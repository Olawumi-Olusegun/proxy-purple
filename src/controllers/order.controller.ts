import { NextFunction, Response } from "express";
import { AuthRequest, IOrder } from "../types/type";
import ProductModel from "../models/product.model";
import CouponModel from "../models/coupon-model";
import { calculateDiscount, validateCoupon } from "../utils/coupon-utils";
import OrderModel from "../models/order.model";
import { FilterQuery, SortOrder } from "mongoose";

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items, couponCode, shippingAddress } = req.body;
    const userId = req.user?.userId;

    // Calculate total amount and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await ProductModel.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock && product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      console.log(product.price);
      console.log(item.quantity);
      console.log(itemTotal);

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });
      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code",
        });
      }

      validateCoupon(coupon);
      discountAmount = calculateDiscount(coupon, totalAmount);
      couponId = coupon._id;

      // Update coupon usage
      coupon.usedCount += 1;
      await coupon.save();
    }

    const finalAmount = totalAmount - discountAmount;

    // Create order
    const order = await OrderModel.create({
      user: userId,
      items: orderItems,
      totalAmount,
      discountAmount,
      finalAmount,
      coupon: couponId,
      shippingAddress,
    });

    // Update product stock
    for (const item of items) {
      await ProductModel.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }
    const itemsPopulatePromise = order.populate("items.product", "name images");
    const couponPopulatePromise = order.populate(
      "coupon",
      "code discountType discountValue"
    );

    await Promise.all([itemsPopulatePromise, couponPopulatePromise]);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === "admin";

    // Parse pagination parameters
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Building search filters
    const filter: FilterQuery<IOrder> = isAdmin ? {} : { user: userId };

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Search by order ID or user email (for admin)
    if (req.query.search && isAdmin) {
      filter.$or = [
        { orderNumber: { $regex: req.query.search, $options: "i" } },
        // Add other searchable fields as needed
      ];
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    // Build sort object
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sort: Record<string, SortOrder> = { [sortBy]: sortOrder };

    // Execute queries in parallel
    const [orders, totalOrders] = await Promise.all([
      OrderModel.find(filter)
        .populate("user", "name email")
        .populate("items.product", "name images")
        .populate("coupon", "code discountType discountValue")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === "admin";

    const filter = isAdmin
      ? { _id: req.params.orderId }
      : { _id: req.params.orderId, user: userId };

    const order = await OrderModel.findOne(filter)
      .populate("user", "name email")
      .populate("items.product", "name images price")
      .populate("coupon", "code discountType discountValue");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("user", "name email")
      .populate("items.product", "name images")
      .populate("coupon", "code discountType discountValue");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const deleteOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("user", "name email")
      .populate("items.product", "name images")
      .populate("coupon", "code discountType discountValue");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
