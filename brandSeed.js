import mongoose from "mongoose";
import Brand from "./src/models/brand.model.js";
import User from "./src/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const brandNames = [
    { name: "FarmCare", description: "Specialized in soil care and fertilizers" },
    { name: "GreenField", description: "Premium seeds and organic inputs" },
    { name: "AgroInput", description: "Modern agricultural technologies" },
    { name: "KrishiSeva", description: "Dedicated to farmer welfare and inputs" },
    { name: "TATA", description: "Trusted brand for quality agro-chemicals" },
    { name: "Bayer", description: "Science for a better life" },
    { name: "UPL", description: "OpenAg network for agricultural growth" }
];

const seedBrands = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for brand seeding");

        // 1. Seed Brands
        for (const b of brandNames) {
            const exists = await Brand.findOne({ name: b.name });
            if (!exists) {
                await Brand.create({
                    ...b,
                    image: {
                        key: "seeded/brand.png",
                        location: `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=random&size=200`
                    }
                });
                console.log(`Created brand: ${b.name}`);
            }
        }

        // 2. Update Admin Permissions
        const result = await User.updateMany(
            { isDeleted: false },
            { $set: { brandAccess: true } }
        );
        console.log(`Updated ${result.modifiedCount} users with brandAccess.`);

        console.log("Seeding brands finished.");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding brands:", err);
        process.exit(1);
    }
};

seedBrands();
