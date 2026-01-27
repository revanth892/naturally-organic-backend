import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    size: { type: String, required: true },
    noInBox: { type: Number, default: 0 },

    customerPrice: { type: Number, default: null },
    customerDiscount: { type: Number, default: 0 },
    showCustomerDiscount: { type: Boolean, default: false },

    retailerPrice: { type: Number, default: null },
    retailerDiscount: { type: Number, default: 0 },
    showRetailerDiscount: { type: Boolean, default: false },

    liveFor: {
        type: String,
        enum: ["none", "customer", "retailer", "both"],
        default: "none",
    },

    description: { type: String, default: null },

    packagingInfo: { type: String, default: null },

    isInStock: { type: Boolean, default: true },

    stockQuantity: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
});

const imageSchema = new mongoose.Schema(
    {
        key: { type: String, required: true },
        location: { type: String, required: true },
        filename: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        unit: { type: String, default: null }, // e.g., ml, gm
        rating: { type: Number, default: null },

        soldBy: { type: String, trim: true },
        manufacturedBy: { type: String, trim: true },

        images: [imageSchema],

        variants: [variantSchema],

        packagingInfo: { type: String, default: null },

        isInStock: { type: Boolean, default: true },

        isDeleted: { type: Boolean, default: false },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Product", productSchema);
