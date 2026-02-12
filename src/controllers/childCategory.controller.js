import ChildCategory from "../models/childCategory.model.js";
import { signChildCategoryImages } from "../utils/s3.js";

// CREATE CHILD CATEGORY
export const createChildCategory = async (req, res) => {
    try {
        const childCategory = await ChildCategory.create(req.body);
        const populated = await childCategory.populate("category subcategory");
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// GET ALL CHILD CATEGORIES (optionally filter by category or subcategory)
export const getAllChildCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { categoryId, subcategoryId, search } = req.query;

        const filter = { isDeleted: false };
        if (categoryId) filter.category = categoryId;
        if (subcategoryId) filter.subcategory = subcategoryId;
        if (search) filter.name = { $regex: search, $options: "i" };

        const total = await ChildCategory.countDocuments(filter);
        const childCategories = await ChildCategory.find(filter)
            .populate("category subcategory")
            .sort({ sortOrder: 1, name: 1 })
            .skip(skip)
            .limit(limit);

        const signedChildCategories = await Promise.all(
            childCategories.map((c) => signChildCategoryImages(c))
        );

        res.json({
            success: true,
            data: signedChildCategories,
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

// GET ONE CHILD CATEGORY
export const getOneChildCategory = async (req, res) => {
    try {
        const childCategory = await ChildCategory.findById(req.params.id).populate("category subcategory");
        if (!childCategory || childCategory.isDeleted) {
            return res.status(404).json({ success: false, message: "Child Category not found" });
        }
        const signed = await signChildCategoryImages(childCategory);
        res.json({ success: true, data: signed });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// UPDATE CHILD CATEGORY
export const updateChildCategory = async (req, res) => {
    try {
        const updated = await ChildCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("category subcategory");

        const signed = await signChildCategoryImages(updated);
        res.json({ success: true, data: signed });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// DELETE CHILD CATEGORY (SOFT DELETE)
export const deleteChildCategory = async (req, res) => {
    try {
        const updated = await ChildCategory.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        ).populate("category subcategory");
        res.json({ success: true, message: "Child Category deleted", data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// UPDATE SORT ORDER
export const updateChildCategorySortOrder = async (req, res) => {
    try {
        const { childCategories } = req.body; // Array of { id, sortOrder }

        const updatePromises = childCategories.map(({ id, sortOrder }) =>
            ChildCategory.findByIdAndUpdate(id, { sortOrder }, { new: true })
        );

        await Promise.all(updatePromises);
        res.json({ success: true, message: "Sort order updated" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
