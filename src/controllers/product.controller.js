import Product from "../models/product.model.js";
import AppUser from "../models/appUser.model.js";

// CREATE PRODUCT
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            updatedBy: req.admin?._id,
        });
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// LIST ALL PRODUCTS
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false })
            .populate("category")
            .populate("updatedBy", "name email")
            .sort({
                createdAt: -1,
            });
        res.json({ success: true, count: products.length, data: products });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET ONE PRODUCT
export const getOneProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category")
            .populate("updatedBy", "name email");
        if (!product || product.isDeleted)
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        res.json({ success: true, data: product });
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
        );
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
        );
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
        );
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
        );
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
        );
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
        );
        res.json({ success: true, message: "Variant deleted", data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// LIST PRODUCTS FOR APP USER (FILTERED BY ROLE)
export const getProductsForUser = async (req, res) => {
    try {
        const user = req.user;

        // Determine target audience for variants
        const audience = user.isRetailer ? ["retailer", "both"] : ["customer", "both"];

        // Find products that have at least one variant matching the audience
        const products = await Product.find({
            isDeleted: false,
            variants: { $elemMatch: { liveFor: { $in: audience }, isActive: true } }
        })
            .populate("category")
            .sort({ createdAt: -1 });

        // Filter out variants that don't belong to the user's audience for each product
        const formattedProducts = products.map(product => {
            const p = product.toObject();
            p.variants = p.variants.filter(v => audience.includes(v.liveFor) && v.isActive);
            return p;
        });

        res.json({ success: true, count: formattedProducts.length, data: formattedProducts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET ONE PRODUCT FOR APP USER (FILTERED BY ROLE)
export const getOneProductForUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const product = await Product.findOne({ _id: id, isDeleted: false }).populate("category");
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const audience = user.isRetailer ? ["retailer", "both"] : ["customer", "both"];

        // Filter variants
        const p = product.toObject();
        p.variants = p.variants.filter(v => audience.includes(v.liveFor) && v.isActive);

        if (p.variants.length === 0) {
            return res.status(403).json({ success: false, message: "This product is not available for your user type" });
        }

        res.json({ success: true, data: p });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
