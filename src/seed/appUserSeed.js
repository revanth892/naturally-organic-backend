import mongoose from "mongoose";
import dotenv from "dotenv";
import AppUser from "../models/appUser.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/naturally_organic";

const users = [
    {
        username: "Ramesh Kumar",
        email: "ramesh@example.com",
        password: "password123",
        phoneNumber: "+919000000001",
        source: "web",
        address: {
            addressType: "Home",
            pincode: "522001",
            buildingNumber: "H-No 4/56",
            area: "Ganesh Nagar",
            village: "Tallayapalem",
            city: "Guntur",
            district: "Guntur",
            state: "Andhra Pradesh",
            landmark: "Near Rythu Bazar"
        },
        profileImages: [],
        cart: []
    },
    {
        username: "Venkatesh Rao",
        email: "venky@example.com",
        password: "password123",
        phoneNumber: "+919900000001",
        source: "web",
        address: {
            addressType: "Home",
            pincode: "524001",
            buildingNumber: "Kalyan Plaza",
            area: "Main Market Road",
            village: "Nellore Town",
            city: "Nellore",
            district: "Nellore",
            state: "Andhra Pradesh",
            landmark: "Opp State Bank"
        },
        profileImages: [],
        cart: []
    }
];

const seedAppUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        console.log("Deleting all existing app users...");
        await AppUser.deleteMany({});

        for (const user of users) {
            const created = await AppUser.create(user);
            console.log(`Created user: ${created.username} (${created.email})`);
        }

        console.log("✅ App Users seeded successfully!");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding error:", err);
        process.exit(1);
    }
};

seedAppUsers();
