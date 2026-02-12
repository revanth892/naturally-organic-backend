import Postcode from "../models/postcode.model.js";

// Get All Postcodes
export const getPostcodes = async (req, res) => {
    try {
        const postcodes = await Postcode.find({ isDeleted: false });
        res.json({ success: true, data: postcodes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Postcode
export const createPostcode = async (req, res) => {
    try {
        const { postcode, freeSameDayDelivery, specialSameDayDelivery, expressDelivery } = req.body;

        // Check if postcode exists
        const existing = await Postcode.findOne({ postcode });
        if (existing) {
            return res.status(400).json({ success: false, message: "Postcode already exists" });
        }

        const newPostcode = new Postcode({
            postcode,
            freeSameDayDelivery,
            specialSameDayDelivery,
            expressDelivery
        });
        await newPostcode.save();
        res.status(201).json({ success: true, data: newPostcode });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Postcode
export const updatePostcode = async (req, res) => {
    try {
        const { id } = req.params;
        const { postcode, freeSameDayDelivery, specialSameDayDelivery, expressDelivery } = req.body;

        const updatedPostcode = await Postcode.findByIdAndUpdate(
            id,
            { postcode, freeSameDayDelivery, specialSameDayDelivery, expressDelivery },
            { new: true }
        );

        if (!updatedPostcode) {
            return res.status(404).json({ success: false, message: "Postcode not found" });
        }
        res.json({ success: true, data: updatedPostcode });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Postcode
export const deletePostcode = async (req, res) => {
    try {
        const { id } = req.params;
        const postcode = await Postcode.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        if (!postcode) {
            return res.status(404).json({ success: false, message: "Postcode not found" });
        }
        res.json({ success: true, message: "Postcode deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
