import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myfarmersolution";

const resetImages = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const resultProducts = await Product.updateMany({}, { $set: { images: [] } });
        console.log(`✅ Cleared images for ${resultProducts.modifiedCount} products.`);

        const resultCategories = await Category.updateMany({}, {
            $set: {
                "image.key": null,
                "image.thumbnailKey": null,
                "image.blurhash": null,
                "image.location": null
            }
        });
        console.log(`✅ Cleared images for ${resultCategories.modifiedCount} categories.`);

    } catch (error) {
        console.error("❌ Error resetting images:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
        process.exit(0);
    }
};

resetImages();
