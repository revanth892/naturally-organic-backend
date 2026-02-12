import mongoose from "mongoose";
import bcrypt from "bcrypt";

const imageSchema = new mongoose.Schema(
    {
        key: { type: String },
        link: { type: String },
        filename: { type: String },
        displayName: { type: String },
    },
    { _id: false }
);

const cartItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1,
        },
    },
    { _id: false }
);

const appUserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        address: {
            addressType: { type: String, trim: true }, // Home, Office, etc.
            pincode: { type: String, trim: true },
            buildingNumber: { type: String, trim: true },
            area: { type: String, trim: true },
            village: { type: String, trim: true },
            city: { type: String, trim: true },
            district: { type: String, trim: true },
            state: { type: String, trim: true },
            landmark: { type: String, trim: true },
        },
        // Document Images
        profileImages: [imageSchema],

        cart: [cartItemSchema],
        source: {
            type: String,
            default: "web",
            trim: true,
        },
        policyChecked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Pre-save hook to hash password
appUserSchema.pre("save", async function (next) {
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
appUserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("AppUser", appUserSchema);
