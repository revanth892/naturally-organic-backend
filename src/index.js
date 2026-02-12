import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.routes.js";
import appUserRoutes from "./routes/appUser.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import orderRoutes from "./routes/order.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import subcategoryRoutes from "./routes/subcategory.route.js";
import childCategoryRoutes from "./routes/childCategory.routes.js";
import cartActivityRoutes from "./routes/cartActivity.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import storeRoutes from "./routes/store.routes.js";
import faqRoutes from "./routes/faq.routes.js";
import postcodeRoutes from "./routes/postcode.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/naturally_organic";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/app-users", appUserRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/child-categories", childCategoryRoutes);
app.use("/api/cart-activity", cartActivityRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/postcodes", postcodeRoutes);

// Database Connection
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
    });
