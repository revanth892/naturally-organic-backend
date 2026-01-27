import AppUser from "../models/appUser.model.js";
import Otp from "../models/otp.model.js";
import Product from "../models/product.model.js";
import jwt from "jsonwebtoken";
import { signUserImages } from "../utils/s3.js";
import AppUserHistory from "../models/appUserHistory.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-it";

// Utility to generate 4-digit OTP
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// GET ALL APP USERS (Dashboard)
export const getAllAppUsers = async (req, res) => {
    try {
        const users = await AppUser.find({})
            .populate("lastEditedBy", "name email")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });

        const signedUsers = await Promise.all(users.map(u => signUserImages(u)));
        res.json({ success: true, count: users.length, data: signedUsers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET SINGLE APP USER (Dashboard)
export const getAppUserById = async (req, res) => {
    try {
        const user = await AppUser.findById(req.params.id)
            .populate("lastEditedBy", "name email")
            .populate("assignedTo", "name email");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const signedUser = await signUserImages(user);
        res.json({ success: true, data: signedUser });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// REQUEST OTP
export const requestOtp = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ success: false, error: "Phone number is required" });
        }

        const otpCode = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        // Upsert OTP record
        await Otp.findOneAndUpdate(
            { phoneNumber },
            { otp: otpCode, expiresAt },
            { upsert: true, new: true }
        );

        // TODO: Integrate with SMS Gateway (e.g., Twilio, Firebase, etc.)
        // For now, logging to console for development
        console.log(`[OTP] For ${phoneNumber}: ${otpCode}`);

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// VERIFY OTP (Login / Register)
export const verifyOtp = async (req, res) => {
    try {
        const { phoneNumber, otp, username, isFarmer, isRetailer } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({ success: false, error: "Phone number and OTP are required" });
        }

        // Check if OTP is valid
        const otpRecord = await Otp.findOne({ phoneNumber, otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
        }

        // OTP verified, check if user exists
        let user = await AppUser.findOne({ phoneNumber });
        let isNewUser = false;

        if (!user) {
            // New user registration
            if (!username) {
                // If username is not provided, we can still create the user with a default or just phone
                // Designing it to be flexible: if no username provided, use phone number as username initially
            }
            user = await AppUser.create({
                phoneNumber,
                username: username || phoneNumber,
                isFarmer: isFarmer || false,
                isRetailer: isRetailer || false,
                policyChecked: req.body.policyChecked || false,
                source: req.body.source || "app",
                isRetailerProfileComplete: req.body.isRetailerProfileComplete || false,
                address: req.body.address || {},
                retailerProfile: req.body.retailerProfile || {},
                cart: []
            });
            isNewUser = true;
        } else {
            // If existing user, update policyChecked if provided and true
            if (req.body.policyChecked) {
                user.policyChecked = true;
                await user.save();
            }
        }

        // Delete OTP after successful verification
        await Otp.deleteOne({ _id: otpRecord._id });

        // Generate JWT Token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });

        const signedUser = await signUserImages(user);

        res.json({
            success: true,
            message: isNewUser ? "Registered & logged in" : "Login successful",
            isNewUser,
            token,
            data: signedUser
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// CART MANAGEMENT - ADD/UPDATE ITEM
export const updateCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, variantId, quantity } = req.body;

        // 1. Basic validation
        if (quantity === undefined) {
            return res.status(400).json({ success: false, error: "Quantity is required" });
        }

        // 2. Fetch User
        const user = await AppUser.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // 3. If adding/updating (quantity > 0), validate product and variant
        if (quantity > 0) {
            const product = await Product.findOne({ _id: productId, isDeleted: false });
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found or deleted" });
            }

            const variant = product.variants.id(variantId);
            if (!variant) {
                return res.status(404).json({ success: false, message: "Variant not found in this product" });
            }

            if (!variant.isActive) {
                return res.status(400).json({ success: false, message: "This variant is currently inactive" });
            }

            if (!variant.isInStock || (variant.stockQuantity !== null && variant.stockQuantity < quantity)) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock available",
                    availableStock: variant.stockQuantity
                });
            }
        }

        // 4. Update logic
        const itemIndex = user.cart.findIndex(
            (item) => item.productId.toString() === productId && item.variantId.toString() === variantId
        );

        if (itemIndex > -1) {
            // Item exists in cart
            if (quantity <= 0) {
                user.cart.splice(itemIndex, 1); // Remove if quantity 0
            } else {
                user.cart[itemIndex].quantity = quantity; // Update quantity
            }
        } else if (quantity > 0) {
            // New item for cart
            user.cart.push({ productId, variantId, quantity });
        }

        await user.save();
        res.json({ success: true, message: "Cart updated", data: user.cart });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// CLEAR CART
export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await AppUser.findByIdAndUpdate(
            userId,
            { $set: { cart: [] } },
            { new: true }
        );
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, message: "Cart cleared", data: [] });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// GET USER PROFILE & CART
export const getProfile = async (req, res) => {
    try {
        const user = await AppUser.findById(req.user._id).populate("cart.productId");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        const signedUser = await signUserImages(user);
        res.json({ success: true, data: signedUser });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// UPDATE APP USER PROFILE (Self)
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const body = req.body;

        const updateData = {};

        // Top-level fields
        if (body.username !== undefined) updateData.username = body.username;
        if (body.isFarmer !== undefined) updateData.isFarmer = body.isFarmer;
        if (body.isRetailer !== undefined) updateData.isRetailer = body.isRetailer;
        if (body.isRetailerProfileComplete !== undefined) updateData.isRetailerProfileComplete = body.isRetailerProfileComplete;
        if (body.source !== undefined) updateData.source = body.source;
        if (body.language !== undefined) updateData.language = body.language;
        if (body.email !== undefined) updateData.email = body.email;

        // Nested Address (Partial)
        if (body.address) {
            for (const [key, value] of Object.entries(body.address)) {
                updateData[`address.${key}`] = value;
            }
        }

        // Nested Retailer Profile (Partial)
        if (body.retailerProfile) {
            for (const [key, value] of Object.entries(body.retailerProfile)) {
                updateData[`retailerProfile.${key}`] = value;
            }
        }

        // Nested Legal and Tax (Partial)
        if (body.legalAndTax) {
            for (const [key, value] of Object.entries(body.legalAndTax)) {
                updateData[`legalAndTax.${key}`] = value;
            }
        }

        // Nested Business Details (Partial)
        if (body.businessDetails) {
            for (const [key, value] of Object.entries(body.businessDetails)) {
                updateData[`businessDetails.${key}`] = value;
            }
        }

        // Image Arrays
        const imageFields = [
            "profileImages", "aadharFrontImages", "aadharBackImages", "panCardImages",
            "gstCertificateImages", "shopFrontImages", "pesticideLicenseImages",
            "seedLicenseImages", "fertilizerLicenseImages", "otherDocuments"
        ];
        imageFields.forEach(field => {
            if (body[field]) updateData[field] = body[field];
        });

        const updatedUser = await AppUser.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const signedUser = await signUserImages(updatedUser);
        res.json({ success: true, message: "Profile updated", data: signedUser });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// ADMIN UPDATE APP USER PROFILE (Dashboard)
export const adminUpdateAppUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const adminId = req.admin._id;
        const body = req.body;

        const updateData = {};
        updateData.lastEditedBy = adminId;

        // Top-level fields
        const topLevelFields = ["username", "phoneNumber", "email", "isFarmer", "isRetailer", "isRetailerProfileComplete", "source", "language", "status", "followUpDate", "interactionCount", "remarks", "assignedTo"];
        topLevelFields.forEach(field => {
            if (body[field] !== undefined) updateData[field] = body[field];
        });

        // Nested Objects
        const nestedObjects = ["address", "retailerProfile", "legalAndTax", "businessDetails"];
        nestedObjects.forEach(objName => {
            if (body[objName]) {
                for (const [key, value] of Object.entries(body[objName])) {
                    // Skip internal mongo/mongoose fields in nested updates
                    if (["_id", "id", "__v", "createdAt", "updatedAt"].includes(key)) continue;
                    updateData[`${objName}.${key}`] = value;
                }
            }
        });

        // Image Arrays
        const imageFields = [
            "profileImages", "aadharFrontImages", "aadharBackImages", "panCardImages",
            "gstCertificateImages", "shopFrontImages", "pesticideLicenseImages",
            "seedLicenseImages", "fertilizerLicenseImages", "otherDocuments"
        ];
        imageFields.forEach(field => {
            if (body[field]) updateData[field] = body[field];
        });

        const updatedUser = await AppUser.findByIdAndUpdate(
            targetUserId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("lastEditedBy", "name email")
            .populate("assignedTo", "name email");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const signedUser = await signUserImages(updatedUser);
        res.json({ success: true, message: "Profile updated by admin", data: signedUser });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// GET APP USER HISTORY (Dashboard)
export const getAppUserHistory = async (req, res) => {
    try {
        const history = await AppUserHistory.find({ appUser: req.params.id })
            .populate("updatedBy", "name email")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: history });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// UPDATE LEAD TRACKING STATUS & REMARKS (Dashboard Specialized)
export const updateLeadTracking = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const adminId = req.admin._id;
        const { status, remarks, followUpDate, interactionCount, assignedTo } = req.body;

        const updatedUser = await AppUser.findByIdAndUpdate(
            targetUserId,
            {
                $set: {
                    status,
                    remarks,
                    followUpDate,
                    interactionCount,
                    assignedTo,
                    lastEditedBy: adminId
                }
            },
            { new: true, runValidators: true }
        ).populate("lastEditedBy", "name email")
            .populate("assignedTo", "name email");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Create History Log
        await AppUserHistory.create({
            appUser: targetUserId,
            status,
            remarks,
            followUpDate,
            interactionCount,
            assignedTo,
            updatedBy: adminId
        });

        const signedUser = await signUserImages(updatedUser);
        res.json({ success: true, message: "Status & Remarks updated", data: signedUser });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
