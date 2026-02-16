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
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/app-users", appUserRoutes);
app.use("/coupons", couponRoutes);
app.use("/orders", orderRoutes);
app.use("/media", mediaRoutes);
app.use("/categories", categoryRoutes);
app.use("/subcategories", subcategoryRoutes);
app.use("/child-categories", childCategoryRoutes);
app.use("/cart-activity", cartActivityRoutes);
app.use("/brands", brandRoutes);
app.use("/stores", storeRoutes);
app.use("/faqs", faqRoutes);
app.use("/postcodes", postcodeRoutes);

// Database Connection
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        if (process.env.NODE_ENV !== "production") {
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
            });
        }
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
    });

export default app;
