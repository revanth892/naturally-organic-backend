import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const checkUser = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const user = await User.findOne({ login: "superadmin" }).select("+password");
        if (user) {
            console.log("User found:", user.login);
            console.log("Password in DB:", user.password);
            const isHashed = user.password.startsWith("$2b$") || user.password.startsWith("$2a$") || user.password.length > 50;
            console.log("Is hashed?", isHashed);
        } else {
            console.log("User 'superadmin' not found.");
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
