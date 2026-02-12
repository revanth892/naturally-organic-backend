import mongoose from "mongoose";
import Category from "./src/models/category.model.js";
import Subcategory from "./src/models/subcategory.model.js";
import dotenv from "dotenv";

dotenv.config();

const checkImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const categories = await Category.find();
        console.log("--- CATEGORIES ---");
        categories.forEach(c => console.log(`${c.name}: ${c.image?.location ? "HAS IMAGE" : "MISSING IMAGE"}`));

        const subcategories = await Subcategory.find();
        console.log("\n--- SUBCATEGORIES ---");
        subcategories.forEach(s => console.log(`${s.name}: ${s.image?.location ? "HAS IMAGE" : "MISSING IMAGE"}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkImages();
