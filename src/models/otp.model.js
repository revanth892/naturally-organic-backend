import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

// TTL index to automatically delete expired OTPs after 5 minutes
// Note: expiresAt is the exact time it should be deleted.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);
