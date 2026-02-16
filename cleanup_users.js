import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";

dotenv.config();

const cleanupUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("📡 Connected to MongoDB...");

        const result = await User.deleteMany({ login: { $ne: "ops_mgr" } });
        console.log(`✅ Deleted ${result.deletedCount} user(s).`);
        console.log("Remaining users:", await User.find({}, 'name login'));

        await mongoose.disconnect();
        console.log("👋 Disconnected from MongoDB.");
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
};

cleanupUsers();
