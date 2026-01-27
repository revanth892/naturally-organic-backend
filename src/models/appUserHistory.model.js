import mongoose from "mongoose";

const appUserHistorySchema = new mongoose.Schema(
    {
        appUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AppUser",
            required: true,
        },
        status: {
            type: String,
        },
        remarks: {
            type: String,
        },
        interactionCount: {
            type: String,
        },
        followUpDate: {
            type: Date,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("AppUserHistory", appUserHistorySchema);
