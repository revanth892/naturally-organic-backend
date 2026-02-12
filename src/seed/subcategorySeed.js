import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/category.model.js";
import Subcategory from "../models/subcategory.model.js";

dotenv.config();

const subcategoryMap = {
    "FRUIT & VEGETABLES": [
        "FRUITS",
        "LEAFY VEGETABLES",
        "VEGETABLES"
    ],
    "FRESH & CHILLED": [
        "DAIRY",
        "PANEER, BUTTER & SPREADS",
        "BATTERS",
        "SWEETS"
    ],
    "FROZEN FOODS": [
        "FRUIT & VEG",
        "ICE CREAMS & SWEETS",
        "PARATHAS",
        "CHTYNEY & CURRIES",
        "SNACKS",
        "SEA FOOD"
    ],
    "GROCERIES": [
        "PULSES & LENTILS",
        "DRY FRUITS, NUTS & SEEDS",
        "HERBS & SPICES",
        "RAVA",
        "COCONUT & MILK PRODUCTS",
        "NOODLES & VERMICELLI",
        "PICKLES",
        "INSTANT MIXES",
        "SAUCES",
        "HONEY JAMS & SPREADS",
        "OIL & GHEE",
        "PAPAD & FAR FAR",
        "SALT, SUGAR & JAGGERY",
        "CANDY & MUKHWAS",
        "DRIED FISH",
        "TEA & COFFEE",
        "SOFT DRINKS",
        "CANNED FOOD",
        "WATER"
    ],
    "SWEETS & SNACKS": [
        "BISCUITS & RUSKS",
        "SWEETS",
        "CHOCOLATES",
        "SNACKS"
    ],
    "RICE & GRAINS": [
        "RICE",
        "MILLETS",
        "POHA, MAMRA"
    ],
    "FLOURS": [
        "FLOURS",
        "BAKING",
        "FOOD COLOUR & ESSENCE"
    ],
    "ALCOHOL": [
        "BEERS, LAGER & ALES",
        "WINES",
        "WHISKEY, SPIRITS"
    ],
    "HEALTH & BEAUTY": [
        "HERBAL",
        "ORAL CARE",
        "HAIR CARE",
        "SKIN CARE",
        "PERSONAL CARE",
        "MEDICINE"
    ],
    "HOUSEHOLD": [
        "KITCHEN ESSENTIALS",
        "LAUNDRY & CLEANING"
    ]
};

const seedSubcategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Soft delete all existing subcategories
        await Subcategory.updateMany({}, { isDeleted: true });
        console.log("Existing subcategories soft-deleted");

        const categories = await Category.find({ isDeleted: false });

        for (const cat of categories) {
            const subs = subcategoryMap[cat.name];
            if (subs) {
                console.log(`Seeding subcategories for: ${cat.name}`);
                for (const subName of subs) {
                    await Subcategory.findOneAndUpdate(
                        { name: subName, category: cat._id },
                        { name: subName, category: cat._id, isDeleted: false },
                        { upsert: true, new: true }
                    );
                }
            }
        }

        console.log("Subcategories seeded successfully");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding subcategories:", err);
        process.exit(1);
    }
};

seedSubcategories();
