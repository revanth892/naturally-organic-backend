import mongoose from "mongoose";

const cartActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AppUser",
        required: true
    },
    action: {
        type: String,
        enum: ["ADD", "REMOVE", "UPDATE_QUANTITY"],
        required: true
    },
    productName: String,
    variantSize: String,
    quantity: Number,
    details: String // human readable summary like "Added 2 x 1L to cart"
}, { timestamps: true });

export default mongoose.model("CartActivity", cartActivitySchema);
