import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const syncProductBrands = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        // 1. Ensure "Naturally Organic" exists as a brand
        let defaultBrand = await db.collection('brands').findOne({ name: "Naturally Organic" });
        if (!defaultBrand) {
            const res = await db.collection('brands').insertOne({
                name: "Naturally Organic",
                isActive: true,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            defaultBrand = { _id: res.insertedId, name: "Naturally Organic" };
            console.log("Created 'Naturally Organic' brand");
        }

        // 2. Get all products
        const products = await db.collection('products').find({}).toArray();
        console.log(`Checking ${products.length} products...`);

        for (const product of products) {
            if (typeof product.brand === 'string') {
                const brandName = product.brand;
                let brandObj = await db.collection('brands').findOne({ name: brandName });

                if (!brandObj) {
                    // If not found, use default or search for similar
                    brandObj = defaultBrand;
                    console.log(`Brand '${brandName}' not found for product '${product.name}', using 'Naturally Organic'`);
                }

                await db.collection('products').updateOne(
                    { _id: product._id },
                    { $set: { brand: brandObj._id } }
                );
                console.log(`Updated product '${product.name}' with brand ID: ${brandObj._id} (${brandObj.name})`);
            }
        }

        console.log("Sync complete!");
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

syncProductBrands();
