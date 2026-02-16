import Category from "../models/category.model.js";
import { signCategoryImages } from "../utils/s3.js";

// CREATE CATEGORY
export const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// GET ALL CATEGORIES
export const getAllCategories = async (req, res) => {
    try {
        const search = req.query.search || "";

        const matchStage = { isDeleted: { $ne: true } };
        if (search) {
            matchStage.name = { $regex: search, $options: "i" };
        }

        const aggregationPipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "category",
                    as: "products",
                },
            },
            {
                $addFields: {
                    productCount: {
                        $size: {
                            $filter: {
                                input: "$products",
                                as: "p",
                                cond: { $eq: ["$$p.isDeleted", false] },
                            },
                        },
                    },
                },
            },
            { $project: { products: 0 } },
            { $sort: { name: 1 } }
        ];

        const categories = await Category.aggregate(aggregationPipeline);

        const signedCategories = await Promise.all(
            categories.map((c) => signCategoryImages(c))
        );

        res.json({
            success: true,
            data: signedCategories,
            count: signedCategories.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET CATEGORY BY ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: "Category not found" });
        }
        const signedCategory = await signCategoryImages(category);
        res.json({ success: true, data: signedCategory });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
    try {
        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        const signedCategory = await signCategoryImages(updated);
        res.json({ success: true, data: signedCategory });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// DELETE CATEGORY (SOFT DELETE)
export const deleteCategory = async (req, res) => {
    try {
        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );
        res.json({ success: true, message: "Category deleted", data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
