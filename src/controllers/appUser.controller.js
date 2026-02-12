import AppUser from "../models/appUser.model.js";
import Product from "../models/product.model.js";
import jwt from "jsonwebtoken";
import { signUserImages, signProductImages } from "../utils/s3.js";
import CartActivity from "../models/cartActivity.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-it";

// GET ALL APP USERS (Dashboard)
export const getAllAppUsers = async (req, res) => {
    try {
        const users = await AppUser.find({})
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
        const user = await AppUser.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const signedUser = await signUserImages(user);
        res.json({ success: true, data: signedUser });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// REGISTER
export const register = async (req, res) => {
    try {
        const { email, password, username, phoneNumber } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ success: false, error: "Email, password and username are required" });
        }

        const existingUser = await AppUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "Email already in use" });
        }

        const user = await AppUser.create({
            email,
            password,
            username,
            phoneNumber,
            policyChecked: req.body.policyChecked || false,
            source: req.body.source || "web",
            address: req.body.address || {},
            cart: []
        });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
        const signedUser = await signUserImages(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            data: signedUser
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password are required" });
        }

        const user = await AppUser.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ success: false, error: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
        const signedUser = await signUserImages(user);

        res.json({
            success: true,
            message: "Login successful",
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

        if (quantity === undefined) {
            return res.status(400).json({ success: false, error: "Quantity is required" });
        }

        const user = await AppUser.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

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

        const itemIndex = user.cart.findIndex(
            (item) => item.productId.toString() === productId && item.variantId.toString() === variantId
        );

        let action = "";
        let logDetails = "";

        if (itemIndex > -1) {
            if (quantity <= 0) {
                action = "REMOVE";
                logDetails = `Removed ${user.cart[itemIndex].quantity} units of product from cart`;
                user.cart.splice(itemIndex, 1);
            } else {
                const oldQty = user.cart[itemIndex].quantity;
                action = "UPDATE_QUANTITY";
                logDetails = `Updated quantity from ${oldQty} to ${quantity}`;
                user.cart[itemIndex].quantity = quantity;
            }
        } else if (quantity > 0) {
            action = "ADD";
            logDetails = `Added ${quantity} units of product to cart`;
            user.cart.push({ productId, variantId, quantity });
        }

        if (action) {
            const product = await Product.findById(productId);
            const variant = product?.variants.id(variantId);
            await CartActivity.create({
                user: userId,
                action,
                productName: product?.name,
                variantSize: variant?.size,
                quantity,
                details: logDetails
            });
        }

        await user.save();

        const updatedUser = await AppUser.findById(userId).populate("cart.productId");

        let cartData = updatedUser.cart.map(item => item.toObject());
        cartData = await Promise.all(cartData.map(async (item) => {
            if (item.productId && typeof item.productId === 'object') {
                item.productId = await signProductImages(item.productId, true);
            }
            return item;
        }));

        res.json({ success: true, message: "Cart updated", data: cartData });
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

        if (signedUser.cart && signedUser.cart.length > 0) {
            signedUser.cart = await Promise.all(signedUser.cart.map(async (item) => {
                if (item.productId && typeof item.productId === 'object') {
                    item.productId = await signProductImages(item.productId, true);
                }
                return item;
            }));
        }

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

        if (body.username !== undefined) updateData.username = body.username;
        if (body.source !== undefined) updateData.source = body.source;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;

        if (body.address) {
            for (const [key, value] of Object.entries(body.address)) {
                updateData[`address.${key}`] = value;
            }
        }

        const imageFields = ["profileImages"];
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
        const body = req.body;

        const updateData = {};

        const topLevelFields = ["username", "phoneNumber", "email", "source"];
        topLevelFields.forEach(field => {
            if (body[field] !== undefined) updateData[field] = body[field];
        });

        const nestedObjects = ["address"];
        nestedObjects.forEach(objName => {
            if (body[objName]) {
                for (const [key, value] of Object.entries(body[objName])) {
                    if (["_id", "id", "__v", "createdAt", "updatedAt"].includes(key)) continue;
                    updateData[`${objName}.${key}`] = value;
                }
            }
        });

        const imageFields = ["profileImages"];
        imageFields.forEach(field => {
            if (body[field]) updateData[field] = body[field];
        });

        const updatedUser = await AppUser.findByIdAndUpdate(
            targetUserId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const signedUser = await signUserImages(updatedUser);
        res.json({ success: true, message: "Profile updated by admin", data: signedUser });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
