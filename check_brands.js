import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const checkBrands = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const brands = await db.collection('brands').find({ name: "Naturally Organic" }).toArray();
        console.log("Brands found:", brands.length);
        if (brands.length > 0) {
            console.log("Brand ID:", brands[0]._id);
        } else {
            const allBrands = await db.collection('brands').find({}).limit(5).toArray();
            console.log("Sample brands:", allBrands.map(b => b.name));
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkBrands();
