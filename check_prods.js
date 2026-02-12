import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const checkProducts = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const products = await db.collection('products').find({}).toArray();
        console.log("Products in DB:", products.length);
        if (products.length > 0) {
            console.log("Sample product brand:", products[0].brand);
            console.log("Type of brand field:", typeof products[0].brand);
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkProducts();
