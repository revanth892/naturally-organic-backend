import Subcategory from "../models/subcategory.model.js";
import { signSubcategoryImages } from "../utils/s3.js";

// CREATE SUBCATEGORY
export const createSubcategory = async (req, res) => {
    try {
        const subcategory = await Subcategory.create(req.body);
        const populated = await subcategory.populate("category");
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// GET ALL SUBCATEGORIES (optionally filter by category)
export const getAllSubcategories = async (req, res) => {
    try {
        const { categoryId, search } = req.query;

        const filter = { isDeleted: false };
        if (categoryId) {
            filter.category = categoryId;
        }
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        const subcategories = await Subcategory.find(filter)
            .populate("category")
            .sort({ sortOrder: 1, name: 1 });

        const signedSubcategories = await Promise.all(
            subcategories.map((s) => signSubcategoryImages(s))
        );

        res.json({
            success: true,
            data: signedSubcategories,
            count: signedSubcategories.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET ONE SUBCATEGORY
export const getOneSubcategory = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id).populate("category");
        if (!subcategory || subcategory.isDeleted) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }
        const signed = await signSubcategoryImages(subcategory);
        res.json({ success: true, data: signed });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// UPDATE SUBCATEGORY
export const updateSubcategory = async (req, res) => {
    try {
        const updated = await Subcategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("category");

        const signed = await signSubcategoryImages(updated);
        res.json({ success: true, data: signed });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// DELETE SUBCATEGORY (SOFT DELETE)
export const deleteSubcategory = async (req, res) => {
    try {
        const updated = await Subcategory.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        ).populate("category");
        res.json({ success: true, message: "Subcategory deleted", data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// UPDATE SORT ORDER
export const updateSubcategorySortOrder = async (req, res) => {
    try {
        const { subcategories } = req.body; // Array of { id, sortOrder }

        const updatePromises = subcategories.map(({ id, sortOrder }) =>
            Subcategory.findByIdAndUpdate(id, { sortOrder }, { new: true })
        );

        await Promise.all(updatePromises);
        res.json({ success: true, message: "Sort order updated" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
