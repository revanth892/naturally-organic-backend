import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/category.model.js";

dotenv.config();

const newCategories = [
    "FRUIT & VEGETABLES",
    "FRESH & CHILLED",
    "FROZEN FOODS",
    "GROCERIES",
    "SWEETS & SNACKS",
    "RICE & GRAINS",
    "FLOURS",
    "ALCOHOL",
    "FESTIVAL/POOJA",
    "HEALTH & BEAUTY",
    "HOUSEHOLD"
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Soft delete all existing categories
        await Category.updateMany({}, { isDeleted: true });
        console.log("Existing categories soft-deleted");

        for (const name of newCategories) {
            await Category.findOneAndUpdate(
                { name },
                { name, isDeleted: false },
                { upsert: true, new: true }
            );
        }

        console.log("New categories seeded successfully");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding categories:", err);
        process.exit(1);
    }
};

seedCategories();
