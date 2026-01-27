import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import AppUser from "../models/appUser.model.js";
import Coupon from "../models/coupon.model.js";

// Helper: Generate Order ID
const generateOrderId = () => {
    const date = new Date();
    const prefix = `ORD-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
};

// PLACE ORDER (Checkout)
export const placeOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { shippingAddress, paymentMethod, couponCode } = req.body;

        const user = await AppUser.findById(userId).populate("cart.productId");

        if (!user || user.cart.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // 1. Calculate Items & Totals + Validate Stock
        let orderItems = [];
        let itemTotal = 0;

        for (const item of user.cart) {
            const product = item.productId; // Populated
            if (!product) continue;

            const variant = product.variants.id(item.variantId);
            if (!variant || !variant.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product or variant not available: ${product.name}`
                });
            }

            if (!variant.isInStock || (variant.stockQuantity !== null && variant.stockQuantity < item.quantity)) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for: ${product.name} - ${variant.label}`
                });
            }

            // Snapshot Data
            const price = variant.price;
            const subtotal = price * item.quantity;

            // Determine active image
            const activeImage = product.images.find(img => img.isActive) || product.images[0];
            const imageUrl = activeImage ? activeImage.url : "";

            orderItems.push({
                product: product._id,
                variantId: variant._id,
                name: product.name,
                variantLabel: variant.label,
                quantity: item.quantity,
                price: price,
                subtotal: subtotal,
                image: imageUrl
            });

            itemTotal += subtotal;
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ success: false, message: "No valid items in cart" });
        }

        // 2. Apply Coupon
        let discountAmount = 0;
        let appliedCouponId = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

            // Basic Coupon Validation (Sync with validate logic roughly)
            if (coupon) {
                const now = new Date();
                const isValidDate = (!coupon.startDate || now >= coupon.startDate) &&
                    (!coupon.endDate || now <= coupon.endDate);
                const isValidLimit = (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit);
                const isValidMinOrder = itemTotal >= coupon.minOrderValue;

                // TODO: Add User Type check if strictness needed here

                if (isValidDate && isValidLimit && isValidMinOrder) {
                    if (coupon.discountType === "fixed") {
                        discountAmount = coupon.discountValue;
                    } else {
                        discountAmount = (itemTotal * coupon.discountValue) / 100;
                        if (coupon.maxDiscountAmount) {
                            discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
                        }
                    }
                    appliedCouponId = coupon._id;
                }
            }
        }

        const shippingCharges = 0; // Logic for shipping can be added here
        const taxTotal = 0; // Logic for tax can be added here

        const finalAmount = Math.max(0, itemTotal + shippingCharges + taxTotal - discountAmount);

        // 3. Create Order
        const newOrder = await Order.create({
            orderId: generateOrderId(),
            user: userId,
            items: orderItems,
            shippingAddress: {
                name: shippingAddress?.name || user.username,
                phoneNumber: shippingAddress?.phoneNumber || user.phoneNumber,
                address: shippingAddress?.address || (typeof user.address === 'string' ? user.address : "") || "Address not provided",
                shopName: user.retailerProfile?.shopName,
                gstNumber: user.retailerProfile?.gstNumber,
            },
            totalItemTotal: itemTotal,
            shippingCharges,
            taxTotal,
            couponApplied: appliedCouponId,
            discountAmount,
            finalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending', // Usually pending until callback
            status: 'confirmed'
        });

        // 4. Post-Order Updates

        // A. Reduce Stock
        for (const item of orderItems) {
            await Product.findOneAndUpdate(
                { _id: item.product, "variants._id": item.variantId },
                { $inc: { "variants.$.stockQuantity": -item.quantity } }
            );
        }

        // B. Update Coupon Usage
        if (appliedCouponId) {
            await Coupon.findByIdAndUpdate(appliedCouponId, { $inc: { usedCount: 1 } });
        }

        // C. Clear User Cart
        await AppUser.findByIdAndUpdate(userId, { $set: { cart: [] } });

        res.status(201).json({ success: true, message: "Order placed successfully", data: newOrder });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET MY ORDERS
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET ORDER BY ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// ADMIN: LIST ALL ORDERS
export const getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "username phoneNumber").sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ADMIN: UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.json({ success: true, message: "Order status updated", data: order });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
