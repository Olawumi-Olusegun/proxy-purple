import { z } from "zod";

const CreateCouponSchema = z.object({
  body: z.object({
    code: z
      .any()
      .refine((val) => val !== undefined && val !== null && val !== "", {
        message: "Coupon code is required",
      })
      .transform((val) => String(val).trim().toUpperCase())
      .refine((val) => val.length > 0, {
        message: "Coupon code cannot be empty",
      }),

    discountType: z
      .any()
      .refine((val) => val !== undefined && val !== null && val !== "", {
        message: "Discount type is required",
      })
      .transform((val) => String(val))
      .refine((val) => val === "percentage" || val === "fixed", {
        message: "Please select a valid discount type: percentage or fixed",
      }),

    discountValue: z
      .any()
      .refine((val) => val !== undefined && val !== null && val !== "", {
        message: "Discount value is required",
      })
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val), {
        message: "Discount value must be a valid number",
      })
      .refine((val) => val >= 0, {
        message: "Discount value must be a positive number",
      }),

    minOrderAmount: z
      .any()
      .optional()
      .transform((val) =>
        val === undefined || val === null || val === "" ? 0 : Number(val)
      )
      .refine((val) => !isNaN(val), {
        message: "Minimum order amount must be a valid number",
      })
      .refine((val) => val >= 0, {
        message: "Minimum order amount cannot be negative",
      }),

    maxDiscountAmount: z
      .any()
      .optional()
      .transform((val) =>
        val === undefined || val === null || val === ""
          ? undefined
          : Number(val)
      )
      .refine((val) => val === undefined || !isNaN(val), {
        message: "Maximum discount amount must be a valid number",
      })
      .refine((val) => val === undefined || val >= 0, {
        message: "Maximum discount amount cannot be negative",
      }),

    validFrom: z.coerce
      .date()
      .refine((date) => !isNaN(date.getTime()), {
        message: "Valid from must be a valid date",
      })
      .optional(),

    validUntil: z.coerce
      .date()
      .refine((date) => !isNaN(date.getTime()), {
        message: "Valid until must be a valid date",
      })
      .optional(),

    expiryDate: z.coerce.date().refine((date) => !isNaN(date.getTime()), {
      message: "Expiry date must be a valid date",
    }),

    usageLimit: z
      .any()
      .refine((val) => val !== undefined && val !== null && val !== "", {
        message: "Usage limit is required",
      })
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val), {
        message: "Usage limit must be a valid number",
      })
      .refine((val) => val >= 1, {
        message: "Usage limit must be at least 1",
      }),

    usedCount: z
      .any()
      .optional()
      .transform((val) => {
        if (val === undefined || val === null || val === "") return 0;
        return Number(val);
      })
      .refine((val) => !isNaN(val), {
        message: "Used count must be a valid number",
      })
      .refine((val) => val >= 0, {
        message: "Used count cannot be negative",
      }),

    status: z
      .enum(["Active", "Inactive", "Expired", "Suspended"])
      .default("Active")
      .optional(),

    isActive: z.boolean().optional().default(true),
  }),
});
const ValidateCouponSchema = z.object({
  body: z.object({
    code: z.string(),
    totalAmount: z.number().positive(),
  }),
});

type CreateCouponSchemaType = z.infer<typeof CreateCouponSchema>["body"];
type ValidateCouponSchemaType = z.infer<typeof ValidateCouponSchema>["body"];

const UpdateCouponSchema = CreateCouponSchema.shape.body.partial();
type UpdateCouponSchemaType = z.infer<typeof UpdateCouponSchema>;

export {
  CreateCouponSchema,
  ValidateCouponSchema,
  UpdateCouponSchema,

  //
  type CreateCouponSchemaType,
  type ValidateCouponSchemaType,
  type UpdateCouponSchemaType,
};
