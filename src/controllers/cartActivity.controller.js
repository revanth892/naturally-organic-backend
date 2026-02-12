import CartActivity from "../models/cartActivity.model.js";

// GET USER CART ACTIVITY / TIMELINE
export const getCartActivity = async (req, res) => {
    try {
        const userId = req.user._id;
        const activities = await CartActivity.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, data: activities });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET ALL USER ACTIVITIES (Admin Dashboard)
export const getAllCartActivities = async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { user: userId } : {};

        const activities = await CartActivity.find(filter)
            .populate("user", "username phoneNumber")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: activities });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
