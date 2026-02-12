import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/product.model.js";
import Brand from "./src/models/brand.model.js";
import Category from "./src/models/category.model.js";
import Subcategory from "./src/models/subcategory.model.js";
import ChildCategory from "./src/models/childCategory.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const testPopulate = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const products = await Product.find({ isDeleted: false })
            .populate("brand")
            .limit(1);

        if (products.length > 0) {
            console.log("Product Name:", products[0].name);
            console.log("Brand Population:", JSON.stringify(products[0].brand, null, 2));
        } else {
            console.log("No products found");
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

testPopulate();
