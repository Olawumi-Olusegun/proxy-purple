import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types/type";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
      maxlength: [100, "Product name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
    },
    proxyType: {
      type: String,
      required: [true, "Please provide a proxy type"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Expired", "Suspended"],
      default: "Active",
    },
    stock: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model<IProduct>("Product", productSchema);
export default ProductModel;
