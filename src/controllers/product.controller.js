import Product from "../models/product.model.js";
import AppUser from "../models/appUser.model.js";
import { signProductImages } from "../utils/s3.js";

// CREATE PRODUCT
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            updatedBy: req.admin?._id,
        });
        const populatedProduct = await product.populate(["category", "subcategory", "childCategory", "brand"]);
        res.status(201).json({ success: true, data: populatedProduct });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// LIST ALL PRODUCTS
export const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";

        const query = { isDeleted: false };
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate("category")
            .populate("subcategory")
            .populate("childCategory")
            .populate("brand")
            .populate("updatedBy", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const signedProducts = await Promise.all(products.map(p => signProductImages(p)));

        res.json({
            success: true,
            data: signedProducts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET ONE PRODUCT
export const getOneProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category")
            .populate("subcategory")
            .populate("childCategory")
            .populate("brand")

            .populate("updatedBy", "name email");
        if (!product || product.isDeleted)
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        const signedProduct = await signProductImages(product);
        res.json({ success: true, data: signedProduct });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    ...req.body,
                    updatedBy: req.admin?._id,
                },
            },
            { new: true, runValidators: true }
        ).populate("category").populate("subcategory").populate("childCategory").populate("brand");
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// SOFT DELETE PRODUCT
export const softDeleteProduct = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { isDeleted: true, updatedBy: req.admin?._id } },
            { new: true }
        ).populate("category").populate("subcategory").populate("childCategory").populate("brand");
        res.json({ success: true, message: "Soft deleted", data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// TOGGLE IMAGE ACTIVE STATE
export const toggleImageActive = async (req, res) => {
    try {
        const updated = await Product.findOneAndUpdate(
            { _id: req.params.productId, "images.key": req.params.imageKey },
            {
                $set: {
                    "images.$.isActive": req.body.isActive,
                    updatedBy: req.admin?._id,
                },
            },
            { new: true }
        ).populate("category").populate("subcategory").populate("childCategory").populate("brand");
        res.json({ success: true, message: "Image updated", data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// ADD NEW VARIANT
export const addVariant = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.productId,
            {
                $push: { variants: req.body },
                $set: { updatedBy: req.admin?._id },
            },
            { new: true, runValidators: true }
        ).populate("category").populate("subcategory").populate("childCategory").populate("brand");
        res.json({ success: true, message: "Variant added", data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// UPDATE VARIANT BY ID
export const updateVariant = async (req, res) => {
    try {
        const setFields = {};
        for (const [key, value] of Object.entries(req.body)) {
            setFields[`variants.$.${key}`] = value;
        }
        setFields[`updatedBy`] = req.admin?._id;

        const updated = await Product.findOneAndUpdate(
            { _id: req.params.productId, "variants._id": req.params.variantId },
            { $set: setFields },
            { new: true, runValidators: true }
        ).populate("category").populate("subcategory").populate("childCategory").populate("brand");
        res.json({ success: true, message: "Variant updated", data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// DELETE VARIANT
export const deleteVariant = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.productId,
            {
                $pull: { variants: { _id: req.params.variantId } },
                $set: { updatedBy: req.admin?._id },
            },
            { new: true }
        ).populate("category").populate("subcategory").populate("childCategory").populate("brand");
        res.json({ success: true, message: "Variant deleted", data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// LIST PRODUCTS FOR APP USER BY CATEGORY (FILTERED BY ROLE)
export const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const products = await Product.find({
            category: categoryId,
            isDeleted: false,
            variants: { $elemMatch: { isActive: true } }
        })
            .populate("category")
            .populate("subcategory")
            .populate("childCategory")
            .populate("brand")

            .sort({ createdAt: -1 });

        const formattedProducts = await Promise.all(products.map(async (product) => {
            const signedProduct = await signProductImages(product, true);
            signedProduct.variants = signedProduct.variants.filter(v => v.isActive);
            return signedProduct;
        }));

        res.json({ success: true, count: formattedProducts.length, data: formattedProducts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// LIST PRODUCTS FOR APP USER (FILTERED BY ROLE)
export const getProductsForUser = async (req, res) => {
    try {
        const products = await Product.find({
            isDeleted: false,
            variants: { $elemMatch: { isActive: true } }
        })
            .populate("category")
            .populate("subcategory")
            .populate("childCategory")
            .populate("brand")

            .sort({ createdAt: -1 });

        const formattedProducts = await Promise.all(products.map(async (product) => {
            const signedProduct = await signProductImages(product);
            signedProduct.variants = signedProduct.variants.filter(v => v.isActive);
            return signedProduct;
        }));

        res.json({ success: true, count: formattedProducts.length, data: formattedProducts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET ONE PRODUCT FOR APP USER (FILTERED BY ROLE)
export const getOneProductForUser = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({ _id: id, isDeleted: false }).populate("category").populate("subcategory").populate("childCategory").populate("brand");
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const p = product.toObject();
        p.variants = p.variants.filter(v => v.isActive);

        if (p.variants.length === 0) {
            return res.status(403).json({ success: false, message: "No active variants available for this product" });
        }

        const signedProduct = await signProductImages(p);
        res.json({ success: true, data: signedProduct });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
