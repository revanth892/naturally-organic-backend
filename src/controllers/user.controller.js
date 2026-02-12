import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-it";

// CREATE CMS USER
export const createUser = async (req, res) => {
    try {
        const { name, login, password, ...permissions } = req.body;

        // Basic validation
        if (!name || !login || !password) {
            return res.status(400).json({ success: false, error: "Name, login and password are required" });
        }

        const user = new User({
            name,
            login,
            password,
            ...permissions // Spread permission flags if provided as an object
        });

        await user.save();

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ success: true, data: userResponse });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// LOGIN CMS USER
export const loginUser = async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ success: false, error: "Login and password are required" });
        }

        const user = await User.findOne({ login }).select("+password");
        if (!user || user.isDeleted) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, error: "Your account is deactivated. Please contact admin." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user._id, role: "admin" },
            JWT_SECRET,
            { expiresIn: "12h" }
        );

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({ success: true, message: "Login successful", token, data: userResponse });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// LIST ALL USERS
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET ONE USER
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.isDeleted) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// EDIT PERMISSIONS
export const updatePermissions = async (req, res) => {
    try {
        const {
            userProfilesAccess,
            productAccess,
            financeAccess,
            userManagementAccess,
            analyticsAccess,
            orderManagementAccess,
            leadManagementAccess,
            couponAccess
        } = req.body;

        const updateData = {};
        if (userProfilesAccess !== undefined) updateData.userProfilesAccess = userProfilesAccess;
        if (productAccess !== undefined) updateData.productAccess = productAccess;
        if (financeAccess !== undefined) updateData.financeAccess = financeAccess;
        if (userManagementAccess !== undefined) updateData.userManagementAccess = userManagementAccess;
        if (analyticsAccess !== undefined) updateData.analyticsAccess = analyticsAccess;
        if (orderManagementAccess !== undefined) updateData.orderManagementAccess = orderManagementAccess;
        if (leadManagementAccess !== undefined) updateData.leadManagementAccess = leadManagementAccess;
        if (couponAccess !== undefined) updateData.couponAccess = couponAccess;
        if (req.body.storeAccess !== undefined) updateData.storeAccess = req.body.storeAccess;
        if (req.body.brandAccess !== undefined) updateData.brandAccess = req.body.brandAccess;
        if (req.body.faqAccess !== undefined) updateData.faqAccess = req.body.faqAccess;
        if (req.body.postcodeAccess !== undefined) updateData.postcodeAccess = req.body.postcodeAccess;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Permissions updated", data: updatedUser });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// TOGGLE USER STATUS
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.isDeleted) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, error: "New password is required" });
        }

        const user = await User.findById(req.params.id);
        if (!user || user.isDeleted) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.password = password;
        await user.save();

        res.json({ success: true, message: "Password reset successful" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
