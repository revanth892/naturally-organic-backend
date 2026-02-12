import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();

const clearProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const result = await Product.deleteMany({});
        console.log(`Deleted ${result.deletedCount} products from the database.`);

        process.exit(0);
    } catch (err) {
        console.error("Error deleting products:", err);
        process.exit(1);
    }
};

clearProducts();
