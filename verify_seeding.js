import mongoose from "mongoose";
import Product from "./src/models/product.model.js";
import dotenv from "dotenv";

dotenv.config();

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const sampleProds = await Product.find().limit(5);

        console.log("--- DATA VERIFICATION SAMPLE ---");
        sampleProds.forEach((p, i) => {
            console.log(`\nProduct ${i + 1}: ${p.name}`);
            console.log(`Images: ${p.images.length}`);
            p.images.forEach((img, j) => console.log(`  - Image ${j + 1}: ${img.location}`));
            console.log(`Variants: ${p.variants.length}`);
            p.variants.forEach((v, k) => {
                console.log(`  - Variant ${k + 1}: Size ${v.size} | Price £${v.customerPrice} | Live: ${v.liveFor}`);
            });
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyData();
