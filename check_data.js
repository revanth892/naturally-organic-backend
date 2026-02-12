import mongoose from "mongoose";
import Category from "./src/models/category.model.js";
import Subcategory from "./src/models/subcategory.model.js";
import Product from "./src/models/product.model.js";
import dotenv from "dotenv";

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const catCount = await Category.countDocuments();
        const subCatCount = await Subcategory.countDocuments();
        const productCount = await Product.countDocuments();

        console.log(`Categories: ${catCount}`);
        console.log(`Subcategories: ${subCatCount}`);
        console.log(`Products: ${productCount}`);

        const categories = await Category.find();
        for (const cat of categories) {
            const subs = await Subcategory.countDocuments({ category: cat._id });
            const prods = await Product.countDocuments({ category: cat._id });
            console.log(`Category: ${cat.name} | Subcategories: ${subs} | Products: ${prods}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
