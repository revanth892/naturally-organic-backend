import Coupon from "../models/coupon.model.js";

// Helper to generate a random code
const generateRandomCode = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// CREATE / GENERATE COUPON
export const createCoupon = async (req, res) => {
    try {
        let { code } = req.body;

        // Auto-generate code if not provided
        if (!code) {
            let isUnique = false;
            while (!isUnique) {
                code = generateRandomCode(8); // e.g., "A7X92B1Z"
                const existing = await Coupon.findOne({ code });
                if (!existing) isUnique = true;
            }
        }

        const coupon = await Coupon.create({
            ...req.body,
            code: code.toUpperCase(),
            updatedBy: req.admin?._id
        });

        res.status(201).json({ success: true, data: coupon });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// LIST ALL COUPONS
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find()
            .populate("updatedBy", "name login")
            .sort({ createdAt: -1 });
        res.json({ success: true, count: coupons.length, data: coupons });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET ONE COUPON BY ID
export const getOneCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id)
            .populate("updatedBy", "name login");
        if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.json({ success: true, data: coupon });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// UPDATE COUPON
export const updateCoupon = async (req, res) => {
    try {
        const updated = await Coupon.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    ...req.body,
                    updatedBy: req.admin?._id
                }
            },
            { new: true, runValidators: true }
        ).populate("updatedBy", "name login");
        if (!updated) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// DELETE COUPON
export const deleteCoupon = async (req, res) => {
    try {
        const deleted = await Coupon.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.json({ success: true, message: "Coupon deleted" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// VALIDATE COUPON CODE (Helper for Checkout)
export const validateCouponCode = async (req, res) => {
    try {
        const { code, cartValue, userType } = req.body; // userType optional if checking for "all"

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ success: false, valid: false, message: "Invalid coupon code" });
        }

        // 1. Check Date
        const now = new Date();
        if (coupon.startDate && now < coupon.startDate) return error(res, "Coupon not yet active");
        if (coupon.endDate && now > coupon.endDate) return error(res, "Coupon expired");

        // 2. Check Global Usage Limit
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return error(res, "Coupon usage limit reached");
        }

        // 3. Check User Type Restriction
        if (coupon.userType !== "all" && userType && coupon.userType !== userType) {
            return error(res, `This coupon is only for ${coupon.userType}s`);
        }

        // 4. Check Minimum Order Value
        if (cartValue && cartValue < coupon.minOrderValue) {
            return error(res, `Minimum order value of ₹${coupon.minOrderValue} required`);
        }

        // 5. Calculate Potential Discount (Just for Info)
        let discount = 0;
        if (coupon.discountType === "fixed") {
            discount = coupon.discountValue;
        } else {
            discount = (cartValue * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount) {
                discount = Math.min(discount, coupon.maxDiscountAmount);
            }
        }

        res.json({
            success: true,
            valid: true,
            message: "Coupon is valid",
            data: coupon,
            estimatedDiscount: discount
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const error = (res, message) => res.status(400).json({ success: false, valid: false, message });
