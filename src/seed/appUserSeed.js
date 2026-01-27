import mongoose from "mongoose";
import dotenv from "dotenv";
import AppUser from "../models/appUser.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myfarmersolution";

const users = [
    {
        username: "Farmer Ramesh",
        phoneNumber: "+919000000001",
        isFarmer: true,
        isRetailer: false,
        source: "app",
        language: "Telugu",
        address: {
            addressType: "Farm",
            pincode: "522001",
            buildingNumber: "H-No 4/56",
            area: "Ganesh Nagar",
            village: "Tallayapalem",
            city: "Guntur",
            district: "Guntur",
            state: "Andhra Pradesh",
            landmark: "Near Rythu Bazar"
        },
        profileImages: [{ key: "p1", link: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200", filename: "profile.jpg" }],
        aadharFrontImages: [{ key: "af1", link: "https://example.com/aadhar-front.jpg", filename: "aadhar_front.jpg" }],
        aadharBackImages: [{ key: "ab1", link: "https://example.com/aadhar-back.jpg", filename: "aadhar_back.jpg" }],
        panCardImages: [{ key: "pan1", link: "https://example.com/pan.jpg", filename: "pan.jpg" }],
        legalAndTax: {
            aadhar: "1234-5678-9012",
            pan: "ABCDE1234F"
        },
        businessDetails: {
            businessType: "Cotton & Chilli Grower",
            annualIncome: "₹4,50,000"
        },
        cart: []
    },
    {
        username: "Retailer Venkatesh",
        phoneNumber: "+919900000001",
        isFarmer: false,
        isRetailer: true,
        isRetailerProfileComplete: true,
        source: "app",
        language: "English",
        address: {
            addressType: "Commercial Shop",
            pincode: "524001",
            shopNumber: "Ground Floor, #G2",
            shopName: "Venkatesh Agri Traders",
            buildingNumber: "Kalyan Plaza",
            area: "Main Market Road",
            village: "Nellore Town",
            city: "Nellore",
            district: "Nellore",
            state: "Andhra Pradesh",
            landmark: "Opp State Bank"
        },
        retailerProfile: {
            shopName: "Venkatesh Agri Traders",
            gstNumber: "37AAAAA0000A1Z5",
            shopAddress: "Main Market, Nellore, 524001"
        },
        legalAndTax: {
            gstNumber: "37AAAAA0000A1Z5",
            pan: "VZXYP9988K",
            aadhar: "9876-5432-1098"
        },
        businessDetails: {
            businessType: "Wholesale Agriculture Inputs",
            annualIncome: "₹25,00,000"
        },
        profileImages: [{ key: "p2", link: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", filename: "venky.jpg" }],
        shopFrontImages: [
            { key: "sf1", link: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800", filename: "shop_display_1.jpg" },
            { key: "sf2", link: "https://images.unsplash.com/photo-1583258292688-d5bb682726d1?auto=format&fit=crop&q=80&w=800", filename: "shop_entry.jpg" }
        ],
        gstCertificateImages: [{ key: "gst1", link: "https://example.com/gst-cert.pdf", filename: "gst.pdf" }],
        pesticideLicenseImages: [{ key: "pl1", link: "https://example.com/pest-lic.jpg", filename: "pesticide_license.jpg" }],
        seedLicenseImages: [{ key: "sl1", link: "https://example.com/seed-lic.jpg", filename: "seed_license.jpg" }],
        fertilizerLicenseImages: [{ key: "fl1", link: "https://example.com/fert-lic.jpg", filename: "fertilizer_license.jpg" }],
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
            console.log(`Created user: ${created.username}`);
        }

        console.log("✅ App Users seeded successfully with comprehensive data!");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding error:", err);
        process.exit(1);
    }
};

seedAppUsers();
