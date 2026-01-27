import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: { type: String },

        // Discount Mechanics
        discountType: {
            type: String,
            enum: ["percentage", "fixed"], // "percentage" = % off, "fixed" = flat ₹ off
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0
        },

        // Restrictions
        minOrderValue: { type: Number, default: 0 },
        maxDiscountAmount: { type: Number }, // Only relevant for percentage
        userType: {
            type: String,
            enum: ["all", "farmer", "retailer"],
            default: "all",
        },

        // Usage Limits (The "count thing")
        usageLimit: { type: Number, default: null }, // Total times this coupon can be redeemed globally. Null = unlimited
        usedCount: { type: Number, default: 0 }, // How many times it has been used so far
        perUserLimit: { type: Number, default: 1 }, // How many times a *specific* user can use it

        // Validity
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        isActive: { type: Boolean, default: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

// Index for fast lookups by code
couponSchema.index({ code: 1 });

export default mongoose.model("Coupon", couponSchema);
