import jwt from "jsonwebtoken";
import AppUser from "../models/appUser.model.js";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-it";

// App User Authentication (Mobile)
export const authenticateAppUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await AppUser.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found or disabled" });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

// CMS User Authentication (Admin)
export const authenticateAdmin = async (req, res, next) => {
    console.log(`[Admin Auth Entry] ${req.method} ${req.originalUrl}`);
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        // Ensure token has 'admin' role (assuming we set this during login)
        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied: Admins only" });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.isDeleted) {
            return res.status(401).json({ success: false, message: "Admin user not found or disabled" });
        }

        req.admin = user; // Separate from req.user to avoid confusion
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};
