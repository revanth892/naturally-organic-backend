import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    variantName: { type: String, default: null },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },

    description: { type: String, default: null },
    packagingInfo: { type: String, default: null },
    isInStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    size: { type: String, default: null },
    noInBox: { type: Number, default: null },
});

const imageSchema = new mongoose.Schema(
    {
        key: { type: String, required: true },
        thumbnailKey: { type: String, default: null }, // Store thumbnail key
        blurhash: { type: String, default: null }, // Store blurhash for instant placeholder
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
        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subcategory",
            default: null,
        },
        childCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChildCategory",
            default: null,
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            default: null,
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
