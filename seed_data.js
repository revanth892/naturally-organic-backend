import mongoose from "mongoose";
import Category from "./src/models/category.model.js";
import Subcategory from "./src/models/subcategory.model.js";
import Product from "./src/models/product.model.js";
import User from "./src/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const productNames = [
    "Growth Booster", "Pest Guard", "Eco Fertilizer", "Nano Urea",
    "Organic Fungicide", "Selective Herbicide", "Bio-Stimulant", "Root Strengthener",
    "Fruit Finisher", "Soil Revitalizer", "Magic Bloom", "Crop Protector",
    "Green Leaf Spray", "Multi-Action Pesticide", "Strong Stem Solution",
    "Rapid Harvest", "Yield Max", "Quality Seed Treat", "Moisture Lock",
    "Micro-Nutrient Mix"
];

const brands = ["FarmCare", "GreenField", "AgroInput", "KrishiSeva", "TATA", "Bayer", "UPL"];
const units = ["ml", "gm", "kg", "ltr"];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // 1. Get an Admin User for updatedBy
        let adminUser = await User.findOne({ isActive: true });
        if (!adminUser) {
            console.log("No user found. Creating a dummy admin user...");
            adminUser = await User.create({
                name: "Admin User",
                login: "admin",
                password: "password123",
                productAccess: true,
                isActive: true
            });
        }
        const updatedBy = adminUser._id;

        // 2. Fetch all subcategories
        const subcategories = await Subcategory.find({ isDeleted: false }).populate("category");
        console.log(`Found ${subcategories.length} subcategories.`);

        if (subcategories.length === 0) {
            console.log("No subcategories found. Please create categories and subcategories first.");
            process.exit(0);
        }

        let addedCount = 0;

        for (const subcat of subcategories) {
            console.log(`Processing subcategory: ${subcat.name} (${subcat.category.name})`);

            // Generate 8-12 products per subcategory for better variety
            const numProds = Math.floor(Math.random() * 5) + 8;

            for (let i = 0; i < numProds; i++) {
                const brand = brands[Math.floor(Math.random() * brands.length)];
                const prodBaseName = productNames[Math.floor(Math.random() * productNames.length)];
                const name = `${brand} ${prodBaseName} ${i + 1}`;
                const unit = units[Math.floor(Math.random() * units.length)];

                const variants = [];
                const numVariants = Math.floor(Math.random() * 3) + 2; // 2 to 4 variants
                const basePrice = Math.floor(Math.random() * 400) + 150;

                for (let v = 0; v < numVariants; v++) {
                    const sizes = unit === "ml" || unit === "ltr" ?
                        ["100ml", "250ml", "500ml", "1ltr", "2.5ltr", "5ltr"] :
                        ["100gm", "250gm", "500gm", "1kg", "2kg", "5kg", "10kg", "25kg"];

                    const multiplier = (v + 1) * 1.5;
                    const customerPrice = Math.floor(basePrice * multiplier);
                    const retailerPrice = Math.floor(customerPrice * 0.75);

                    variants.push({
                        size: sizes[Math.floor(Math.random() * sizes.length)],
                        noInBox: Math.floor(Math.random() * 24) + 6,
                        customerPrice,
                        customerDiscount: Math.random() > 0.3 ? Math.floor(Math.random() * 25) : 0,
                        showCustomerDiscount: Math.random() > 0.4,
                        retailerPrice,
                        retailerDiscount: Math.random() > 0.3 ? Math.floor(Math.random() * 15) : 0,
                        showRetailerDiscount: Math.random() > 0.4,
                        liveFor: "both",
                        description: `High quality ${prodBaseName} in ${unit} unit.`,
                        packagingInfo: "Industrial standard packaging",
                        isInStock: true,
                        stockQuantity: Math.floor(Math.random() * 500) + 50,
                        isActive: true
                    });
                }

                // Random placeholder images from a set of dummy URLs
                const imageCount = Math.floor(Math.random() * 2) + 1;
                const images = [];
                for (let img = 0; img < imageCount; img++) {
                    const randomId = Math.floor(Math.random() * 1000);
                    images.push({
                        key: `seeded/prod_${addedCount}_${img}.jpg`,
                        thumbnailKey: `seeded/thumb_prod_${addedCount}_${img}.jpg`,
                        blurhash: "L6PZfS_f.AyD_WD%jt_f.AyD_WD%",
                        location: `https://picsum.photos/id/${randomId}/600/600`,
                        filename: `product_${addedCount}_${img}.jpg`
                    });
                }

                await Product.create({
                    name,
                    category: subcat.category._id,
                    subcategory: subcat._id,
                    unit,
                    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                    soldBy: "My Farmer Solution",
                    manufacturedBy: brand,
                    images,
                    variants,
                    packagingInfo: "Tamper proof sealed container",
                    isInStock: true,
                    updatedBy
                });
                addedCount++;
            }
        }

        console.log(`\n\n✅ SEEDING COMPLETE!`);
        console.log(`Total Products Added: ${addedCount}`);
        process.exit(0);
    } catch (err) {
        console.error("❌ ERROR SEEDING DATA:", err);
        process.exit(1);
    }
};

seedData();
