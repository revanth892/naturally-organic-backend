import Store from "../models/store.model.js";

export const getStore = async (req, res) => {
    try {
        // Assuming there's only one store entry for now, or fetch list
        const stores = await Store.find({ isDeleted: false });
        res.json({ success: true, data: stores });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createStore = async (req, res) => {
    try {
        const { images, name, address, phone, openingHours, googleMapsLink } = req.body;
        const store = new Store({ images, name, address, phone, openingHours, googleMapsLink });
        await store.save();
        res.status(201).json({ success: true, data: store });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const { images, name, address, phone, openingHours, googleMapsLink } = req.body;
        const store = await Store.findByIdAndUpdate(
            id,
            { images, name, address, phone, openingHours, googleMapsLink },
            { new: true }
        );
        if (!store) {
            return res.status(404).json({ success: false, message: "Store not found" });
        }
        res.json({ success: true, data: store });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const store = await Store.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        if (!store) {
            return res.status(404).json({ success: false, message: "Store not found" });
        }
        res.json({ success: true, message: "Store deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
