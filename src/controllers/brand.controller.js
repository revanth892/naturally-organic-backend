import Brand from "../models/brand.model.js";
import { signBrandImages } from "../utils/s3.js";

// CREATE BRAND
export const createBrand = async (req, res) => {
    try {
        const brand = await Brand.create(req.body);
        res.status(201).json({ success: true, data: brand });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// GET ALL BRANDS
export const getAllBrands = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
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
                    foreignField: "brand",
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
            { $sort: { name: 1 } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [{ $skip: skip }, { $limit: limit }]
                }
            }
        ];

        const result = await Brand.aggregate(aggregationPipeline);
        const brands = result[0].data;
        const total = result[0].metadata[0]?.total || 0;

        const signedBrands = await Promise.all(
            brands.map((b) => signBrandImages(b))
        );

        res.json({
            success: true,
            data: signedBrands,
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

// GET BRAND BY ID
export const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, error: "Brand not found" });
        }
        const signedBrand = await signBrandImages(brand);
        res.json({ success: true, data: signedBrand });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// UPDATE BRAND
export const updateBrand = async (req, res) => {
    try {
        const updated = await Brand.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        const signedBrand = await signBrandImages(updated);
        res.json({ success: true, data: signedBrand });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// DELETE BRAND (SOFT DELETE)
export const deleteBrand = async (req, res) => {
    try {
        const updated = await Brand.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );
        res.json({ success: true, message: "Brand deleted", data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
