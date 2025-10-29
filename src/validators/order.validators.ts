import { z } from "zod";

// OrderItem schema
const OrderItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
});

// Shipping address schema
const ShippingAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

// Order status enum
const OrderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

// Main order schema
const OrderSchema = z.object({
  user: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  items: z.array(OrderItemSchema).min(1, "Order must have at least one item"),
  totalAmount: z.number().min(0, "Total amount cannot be negative"),
  discountAmount: z
    .number()
    .min(0, "Discount amount cannot be negative")
    .default(0),
  finalAmount: z.number().min(0, "Final amount cannot be negative"),
  coupon: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid coupon ID")
    .optional(),
  status: OrderStatusSchema.default("pending"),
  shippingAddress: ShippingAddressSchema,
});

// Schema for creating a new order (without timestamps)
const CreateOrderSchema = OrderSchema;

// Schema for updating an order (all fields optional except ID validation)
const UpdateOrderSchema = OrderSchema.partial();

const CreateOrderSchemaWithCouponCode = z.object({
  items: z.array(OrderItemSchema).min(1, "Order must have at least one item"),
  couponCode: z.string().optional(),
  shippingAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
  }),
});

// Type inference
type OrderItemSchema = z.infer<typeof OrderItemSchema>;
type ShippingAddressSchema = z.infer<typeof ShippingAddressSchema>;
type OrderStatusSchema = z.infer<typeof OrderStatusSchema>;
type OrderSchema = z.infer<typeof OrderSchema>;
type CreateOrderSchema = z.infer<typeof CreateOrderSchema>;
type UpdateOrderSchema = z.infer<typeof UpdateOrderSchema>;

export {
  OrderItemSchema,
  ShippingAddressSchema,
  OrderStatusSchema,
  OrderSchema,
  CreateOrderSchema,
  UpdateOrderSchema,
  CreateOrderSchemaWithCouponCode,
};
