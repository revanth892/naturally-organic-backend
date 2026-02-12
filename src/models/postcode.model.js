import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    isEligible: { type: Boolean, default: false },
    description: { type: String, default: "" },
    minimumValue: { type: Number, default: 0 }
}, { _id: false });

const postcodeSchema = new mongoose.Schema(
    {
        postcode: { type: String, required: true, unique: true },
        freeSameDayDelivery: { type: serviceSchema, default: () => ({}) },
        specialSameDayDelivery: { type: serviceSchema, default: () => ({}) },
        expressDelivery: { type: serviceSchema, default: () => ({}) },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Postcode", postcodeSchema);
