import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...\n");

        const user = await User.findOne({ login: "superadmin" }).select("+password");

        if (!user) {
            console.log("❌ User 'superadmin' NOT FOUND in database!");
            console.log("Please run: npm run seed:users");
        } else {
            console.log("✅ User found:");
            console.log("Name:", user.name);
            console.log("Login:", user.login);
            console.log("Is Active:", user.isActive);
            console.log("Is Deleted:", user.isDeleted);
            console.log("Password Hash:", user.password.substring(0, 20) + "...");
            console.log("\nPermissions:");
            console.log("- User Profiles:", user.userProfilesAccess);
            console.log("- Product:", user.productAccess);
            console.log("- Finance:", user.financeAccess);
            console.log("- User Management:", user.userManagementAccess);
            console.log("- Analytics:", user.analyticsAccess);
            console.log("- Order Management:", user.orderManagementAccess);
            console.log("- Lead Management:", user.leadManagementAccess);
            console.log("- Coupon:", user.couponAccess);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
};

checkUser();
