import mongoose from "mongoose";
import dotenv from "dotenv";
import AppUser from "./src/models/appUser.model.js";

dotenv.config();

const clearAppUserImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("📡 Connected to MongoDB...");

        const result = await AppUser.updateMany({}, { $set: { profileImages: [] } });
        console.log(`✅ Cleared profile images for ${result.modifiedCount} app user(s).`);

        await mongoose.disconnect();
        console.log("👋 Disconnected from MongoDB.");
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
};

clearAppUserImages();
