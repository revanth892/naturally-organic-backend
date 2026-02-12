import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        openingHours: [{
            day: { type: String, required: true },
            open: { type: String, default: "" },
            close: { type: String, default: "" },
            isClosed: { type: Boolean, default: false }
        }],
        googleMapsLink: { type: String, default: "" },
        images: [{
            key: { type: String, required: true },
            location: { type: String, required: true },
        }],
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Store", storeSchema);
