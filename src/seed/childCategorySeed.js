import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/category.model.js";
import Subcategory from "../models/subcategory.model.js";
import ChildCategory from "../models/childCategory.model.js";

dotenv.config();

const childCategoryMap = [
    {
        category: "GROCERIES",
        subcategory: "PULSES & LENTILS",
        children: ["PULSES", "LENTILS", "BEANS"]
    },
    {
        category: "GROCERIES",
        subcategory: "DRY FRUITS, NUTS & SEEDS",
        children: ["DRY FRUITS", "NUTS", "SEEDS"]
    },
    {
        category: "GROCERIES",
        subcategory: "HERBS &鼎PICES", // Note: The previous seed used "HERBS & SPICES"
        subcategoryAlt: "HERBS & SPICES",
        children: ["WHOLE SPICES", "GROUND SPICES", "MASALA", "TAMARIND"]
    },
    {
        category: "GROCERIES",
        subcategory: "NOODLES & VERMICELLI",
        children: ["NOODLES", "VERMICELLI", "PASTA"]
    },
    {
        category: "GROCERIES",
        subcategory: "PICKLES",
        children: ["PICKLES", "SPICE POWDERS"]
    },
    {
        category: "GROCERIES",
        subcategory: "INSTANT MIXES",
        children: ["READY TO EAT", "INSTANT MIX", "INSTANT SOUPS"]
    },
    {
        category: "GROCERIES",
        subcategory: "OIL & GHEE",
        children: ["OILS", "GHEE"]
    },
    {
        category: "GROCERIES",
        subcategory: "PAPAD & FAR FAR",
        children: ["PAPADOMS", "FAR FAR"]
    },
    {
        category: "GROCERIES",
        subcategory: "SALT, SUGAR & JAGGERY",
        children: ["SUGAR", "JAGGERY"]
    },
    {
        category: "GROCERIES",
        subcategory: "CANDY & MUKHWAS",
        children: ["CANDY", "MUKHWAS"]
    },
    {
        category: "GROCERIES",
        subcategory: "TEA & COFFEE",
        children: ["TEA", "COFFEE"]
    },
    {
        category: "GROCERIES",
        subcategory: "SOFT DRINKS",
        children: ["DRINKS", "JUICES"]
    },
    {
        category: "GROCERIES",
        subcategory: "CANNED FOOD",
        children: ["CANNED VEGETABLES", "CANNED FRUITS", "CANNED BEANS, PEAS & PULSES", "CANNED MEALS", "CANNED FISH"]
    },
    {
        category: "SWEETS & SNACKS",
        subcategory: "SNACKS",
        children: ["SAVOURIES", "CRISPS", "CHAT"]
    },
    {
        category: "RICE & GRAINS",
        subcategory: "RICE",
        children: ["SONA MASOORI RICE", "BASUMATI RICE", "IDLI RICE", "PONNI RICE", "JEERA SAMBA RICE", "MATTA RICE", "SPECIAL RICE"]
    },
    {
        category: "RICE & GRAINS",
        subcategory: "MILLETS",
        children: ["ALL MILLETS", "MILLET MIXES"]
    },
    {
        category: "RICE & GRAINS",
        subcategory: "POHA, MAMRA",
        children: ["POHA", "MAMRA"]
    },
    {
        category: "ALCOHOL",
        subcategory: "WINES",
        children: ["RED WINE", "WHITE WINE", "ROSE WINE"]
    }
];

const seedChildCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Soft delete all existing child categories
        await ChildCategory.updateMany({}, { isDeleted: true });
        console.log("Existing child categories soft-deleted");

        for (const entry of childCategoryMap) {
            const cat = await Category.findOne({ name: entry.category, isDeleted: false });
            if (!cat) {
                console.error(`Category not found: ${entry.category}`);
                continue;
            }

            const sub = await Subcategory.findOne({
                name: entry.subcategoryAlt || entry.subcategory,
                category: cat._id,
                isDeleted: false
            });

            if (!sub) {
                console.error(`Subcategory not found: ${entry.subcategory} under ${entry.category}`);
                continue;
            }

            console.log(`Seeding child categories for: ${cat.name} -> ${sub.name}`);
            for (const childName of entry.children) {
                await ChildCategory.findOneAndUpdate(
                    { name: childName, subcategory: sub._id, category: cat._id },
                    { name: childName, subcategory: sub._id, category: cat._id, isDeleted: false },
                    { upsert: true, new: true }
                );
            }
        }

        console.log("Child categories seeded successfully");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding child categories:", err);
        process.exit(1);
    }
};

seedChildCategories();
