import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        login: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true, select: false },

        // Permission Flags
        userProfilesAccess: { type: Boolean, default: false },
        productAccess: { type: Boolean, default: false },
        financeAccess: { type: Boolean, default: false },
        userManagementAccess: { type: Boolean, default: false },
        analyticsAccess: { type: Boolean, default: false },
        orderManagementAccess: { type: Boolean, default: false },
        leadManagementAccess: { type: Boolean, default: false },
        couponAccess: { type: Boolean, default: false },
        brandAccess: { type: Boolean, default: false },
        storeAccess: { type: Boolean, default: false },
        faqAccess: { type: Boolean, default: false },
        postcodeAccess: { type: Boolean, default: false },

        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
