import mongoose from "mongoose";

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
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        isFarmer: {
            type: Boolean,
            default: false,
        },
        isRetailer: {
            type: Boolean,
            default: false,
        },
        address: {
            addressType: { type: String, trim: true }, // Home, Office, Shop, etc.
            pincode: { type: String, trim: true },
            buildingNumber: { type: String, trim: true },
            shopNumber: { type: String, trim: true },
            shopName: { type: String, trim: true },
            area: { type: String, trim: true },
            village: { type: String, trim: true },
            city: { type: String, trim: true },
            district: { type: String, trim: true },
            state: { type: String, trim: true },
            landmark: { type: String, trim: true },
        },
        legalAndTax: {
            gstNumber: { type: String, trim: true },
            pan: { type: String, trim: true },
            aadhar: { type: String, trim: true },
        },
        businessDetails: {
            businessType: { type: String, trim: true },
            annualIncome: { type: String, trim: true },
        },
        language: {
            type: String,
            default: "English",
            trim: true,
        },
        // Document Images
        profileImages: [imageSchema],
        aadharFrontImages: [imageSchema],
        aadharBackImages: [imageSchema],
        panCardImages: [imageSchema],
        gstCertificateImages: [imageSchema],
        shopFrontImages: [imageSchema],
        pesticideLicenseImages: [imageSchema],
        seedLicenseImages: [imageSchema],
        fertilizerLicenseImages: [imageSchema],
        otherDocuments: [imageSchema],

        retailerProfile: {
            shopName: { type: String, trim: true },
            gstNumber: { type: String, trim: true },
            shopAddress: { type: String, trim: true },
            // Keeping licenses here for backward compat or specific needs
            licenses: [
                {
                    licenseName: { type: String },
                    licenseNumber: { type: String },
                    image: { type: String },
                },
            ],
        },
        cart: [cartItemSchema],
        source: {
            type: String,
            default: "app",
            trim: true,
        },
        isRetailerProfileComplete: {
            type: Boolean,
            default: false,
        },
        lastEditedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            default: "New Lead",
            enum: ["New Lead", "Follow up", "FO Pending", "KYC Pending"],
        },
        followUpDate: {
            type: Date,
        },
        interactionCount: {
            type: String,
            default: "0 times",
        },
        remarks: {
            type: String,
            trim: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        policyChecked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("AppUser", appUserSchema);
