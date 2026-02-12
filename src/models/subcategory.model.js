import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        image: {
            key: { type: String, default: null },
            thumbnailKey: { type: String, default: null },
            blurhash: { type: String, default: null },
            location: { type: String, default: null },
        },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Index for faster queries
subcategorySchema.index({ category: 1, isDeleted: 1 });
subcategorySchema.index({ name: 1 });

export default mongoose.model("Subcategory", subcategorySchema);
