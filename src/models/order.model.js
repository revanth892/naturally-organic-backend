import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    variantId: { type: String, required: true }, // The specific variant ID
    name: { type: String, required: true }, // Snapshot of product name
    variantLabel: { type: String, required: true }, // Snapshot e.g., "500g Packet"
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // Snapshot of price AT TIME OF ORDER
    tax: { type: Number, default: 0 },
    subtotal: { type: Number, required: true }, // price * quantity
    image: { type: String }, // Snapshot of main image
});

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            unique: true,
            required: true,
        }, // Readable ID e.g., ORD-20240101-1234

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AppUser",
            required: true,
        },

        items: [orderItemSchema],

        // Shipping Snapshot (Address might change in profile, but not for this order)
        shippingAddress: {
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true }, // Full address string
            // Retailer specific snapshots
            shopName: String,
            gstNumber: String,
        },

        // Financials
        totalItemTotal: { type: Number, required: true }, // Sum of items subtotal
        shippingCharges: { type: Number, default: 0 },
        taxTotal: { type: Number, default: 0 },

        // Discount / Coupon
        couponApplied: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
        discountAmount: { type: Number, default: 0 },

        // Final Payable
        finalAmount: { type: Number, required: true },

        // Statuses
        status: {
            type: String,
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
            default: "pending",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["cod", "online"],
            default: "cod",
        },
        paymentDetails: { type: Object }, // Store gateway response here

        // Meta
        notes: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
