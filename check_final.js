import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const checkProductsFinal = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const products = await db.collection('products').find({}).toArray();
        console.log("Total Products:", products.length);
        for (const p of products) {
            console.log(`Product: ${p.name}, Brand Field: ${p.brand}, Type: ${typeof p.brand}, Is ObjectId: ${p.brand instanceof mongoose.Types.ObjectId}`);
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkProductsFinal();
