import { NextFunction, Request, Response } from "express";
import ProductModel from "../models/product.model";
import { FilterQuery } from "mongoose";
import { IProduct } from "../types/type";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      proxyType,
      status,
      renewalDate,
      images,
    } = req.body;

    const product = await ProductModel.create({
      name,
      description,
      price,
      category,
      stock,
      proxyType,
      status,
      renewalDate,
      images,
    });

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Failed to create product",
      });
    }

    res.status(201).json({
      success: true,
      data: product,
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

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Default values
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const category = req.query.category;

    const filter: FilterQuery<IProduct> = {};
    if (category) filter.category = category;

    const [products, totalProducts] = await Promise.all([
      ProductModel.find(filter)
        .limit(Number(limit) * 1)
        .skip(skip)
        .sort({ createdAt: -1 }),

      ProductModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: {
        products,
        currentPage: page,
        totalPages,
        totalProducts,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
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

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await ProductModel.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
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

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const productId = req.params.productId;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
  try {
    const product = await ProductModel.findByIdAndUpdate(productId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
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

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const productId = req.params.productId;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  try {
    const product = await ProductModel.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
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
