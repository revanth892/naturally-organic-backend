import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/category.model.js";
import Subcategory from "../models/subcategory.model.js";
import ChildCategory from "../models/childCategory.model.js";
import Product from "../models/product.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const seedData = async () => {
    try {
        if (!MONGODB_URI) throw new Error("MONGODB_URI not found");

        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for Master Seeding...");

        // 1. Clear existing data
        console.log("Cleaning existing catalog data...");
        await Category.deleteMany({});
        await Subcategory.deleteMany({});
        await ChildCategory.deleteMany({});
        await Product.deleteMany({});

        // 2. Create Categories
        console.log("Seeding Categories...");
        const catNutrients = await Category.create({
            name: "Nutrients",
            description: "Organic fertilizers and growth enhancers for healthy crops."
        });

        const catProtection = await Category.create({
            name: "Protection",
            description: "Natural pest control and disease management solutions."
        });

        // 3. Create Subcategories
        console.log("Seeding Subcategories...");
        const subOrganicFert = await Subcategory.create({
            name: "Organic Fertilizers",
            category: catNutrients._id,
            description: "Nutrient-rich organic inputs."
        });

        const subGrowthPromoters = await Subcategory.create({
            name: "Growth Promoters",
            category: catNutrients._id,
            description: "Boosts crop yield and quality."
        });

        const subBioPest = await Subcategory.create({
            name: "Bio-Pesticides",
            category: catProtection._id,
            description: "Safe and effective pest management."
        });

        // 4. Create Child Categories (2nd Level)
        console.log("Seeding Child Categories...");
        const childLiquidBio = await ChildCategory.create({
            name: "Liquid Bio-Fertilizers",
            category: catNutrients._id,
            subcategory: subOrganicFert._id,
            description: "Concentrated liquid organic nutrients."
        });

        const childGranularBio = await ChildCategory.create({
            name: "Granular Bio-Fertilizers",
            category: catNutrients._id,
            subcategory: subOrganicFert._id,
            description: "Slow-release granular organic nutrients."
        });

        const childNeemBased = await ChildCategory.create({
            name: "Neem Based Solutions",
            category: catProtection._id,
            subcategory: subBioPest._id,
            description: "Traditional neem-based pest repellents."
        });

        // 5. Create Products
        console.log("Seeding Products...");
        await Product.create({
            name: "Bio-Power Liquid",
            category: catNutrients._id,
            subcategory: subOrganicFert._id,
            childCategory: childLiquidBio._id,
            brand: "Naturally Organic",
            unit: "ml",
            description: "Premium liquid bio-fertilizer for all crops.",
            variants: [
                { variantName: "500ml Bottle", price: 450, stockQuantity: 100, isActive: true },
                { variantName: "1L Bottle", price: 800, stockQuantity: 50, isActive: true }
            ]
        });

        await Product.create({
            name: "Root-Boost Granules",
            category: catNutrients._id,
            subcategory: subOrganicFert._id,
            childCategory: childGranularBio._id,
            brand: "Nature-Safe",
            unit: "kg",
            description: "Enriched granular compost for strong roots.",
            variants: [
                { variantName: "5kg Bag", price: 600, stockQuantity: 200, isActive: true },
                { variantName: "25kg Drum", price: 2500, stockQuantity: 40, isActive: true }
            ]
        });

        await Product.create({
            name: "Neem-Shield 1500",
            category: catProtection._id,
            subcategory: subBioPest._id,
            childCategory: childNeemBased._id,
            brand: "Naturally Organic",
            unit: "ml",
            description: "High potency neem oil concentrate.",
            variants: [
                { variantName: "Standard 250ml", price: 350, stockQuantity: 150, isActive: true }
            ]
        });

        await Product.create({
            name: "Fast-Grow Plus",
            category: catNutrients._id,
            subcategory: subGrowthPromoters._id,
            childCategory: null, // Testing product without child category
            brand: "Agro-Pro",
            unit: "ml",
            description: "Generic growth promoter without a specific child category.",
            variants: [
                { variantName: "Default 500ml", price: 550, stockQuantity: 80, isActive: true }
            ]
        });

        console.log("✅ Master Seeding Completed Successfully!");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    }
};

seedData();
