import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;

const usersToCreate = [
    {
        name: "Operations Manager",
        login: "ops_mgr",
        password: "OpsMgrPass2026!",
        userProfilesAccess: true,
        productAccess: true,
        financeAccess: true,
        userManagementAccess: true,
        analyticsAccess: true,
        orderManagementAccess: true,
        leadManagementAccess: true,
        couponAccess: true,
        storeAccess: true,
        brandAccess: true,
        faqAccess: true,
        postcodeAccess: true
    }
];

const seedCMSUsers = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env");
        }

        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for CMS user seeding...");

        const results = [];

        for (const userData of usersToCreate) {
            let user = await User.findOne({ login: userData.login });

            if (user) {
                // Update existing user properties
                user.name = userData.name;
                user.password = userData.password; // This will trigger hash on save
                user.userProfilesAccess = userData.userProfilesAccess;
                user.productAccess = userData.productAccess;
                user.financeAccess = userData.financeAccess;
                user.userManagementAccess = userData.userManagementAccess;
                user.analyticsAccess = userData.analyticsAccess;
                user.orderManagementAccess = userData.orderManagementAccess;
                user.leadManagementAccess = userData.leadManagementAccess;
                user.couponAccess = userData.couponAccess;
                user.storeAccess = userData.storeAccess;
                user.brandAccess = userData.brandAccess;
                user.faqAccess = userData.faqAccess;
                user.postcodeAccess = userData.postcodeAccess;
            } else {
                // Create new user
                user = new User(userData);
            }

            await user.save();

            results.push({
                Name: userData.name,
                Username: userData.login,
                Password: userData.password,
                Access: {
                    userProfiles: userData.userProfilesAccess,
                    product: userData.productAccess,
                    finance: userData.financeAccess,
                    userManagement: userData.userManagementAccess,
                    analytics: userData.analyticsAccess,
                    orderManagement: userData.orderManagementAccess,
                    leadManagement: userData.leadManagementAccess,
                    coupon: userData.couponAccess,
                    store: userData.storeAccess,
                    brand: userData.brandAccess,
                    faq: userData.faqAccess,
                    postcode: userData.postcodeAccess
                }
            });
        }

        console.log("✅ CMS Users seeded successfully!");

        // Write to credentials file
        const credentialsPath = path.join(process.cwd(), "cms_user_credentials.json");
        const txtCredentialsPath = path.join(process.cwd(), "cms_user_credentials.txt");

        fs.writeFileSync(credentialsPath, JSON.stringify(results, null, 2));

        // Also create a pretty text table for easy reading
        let txtOutput = "CMS USER CREDENTIALS\n";
        txtOutput += "===================================================================================================\n";
        txtOutput += `${"Name".padEnd(20)} | ${"Username".padEnd(15)} | ${"Password".padEnd(20)} | Access\n`;
        txtOutput += "---------------------------------------------------------------------------------------------------\n";

        results.forEach(u => {
            const accessStr = Object.entries(u.Access)
                .filter(([_, val]) => val)
                .map(([key, _]) => key)
                .join(", ") || "None";

            txtOutput += `${u.Name.padEnd(20)} | ${u.Username.padEnd(15)} | ${u.Password.padEnd(20)} | ${accessStr}\n`;
        });

        fs.writeFileSync(txtCredentialsPath, txtOutput);
        console.log(`✅ Credentials saved to ${credentialsPath} and ${txtCredentialsPath}`);

        process.exit();
    } catch (err) {
        console.error("❌ Seeding error:", err);
        process.exit(1);
    }
};

seedCMSUsers();
