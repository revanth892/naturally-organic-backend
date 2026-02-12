import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String, trim: true },
        image: {
            key: { type: String, default: null },
            thumbnailKey: { type: String, default: null },
            blurhash: { type: String, default: null },
            location: { type: String, default: null },
        },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
