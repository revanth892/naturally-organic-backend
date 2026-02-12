import FAQ from "../models/faq.model.js";

export const getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find({ isDeleted: false });
        res.json({ success: true, data: faqs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createFAQ = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const faq = new FAQ({ question, answer });
        await faq.save();
        res.status(201).json({ success: true, data: faq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        const faq = await FAQ.findByIdAndUpdate(
            id,
            { question, answer },
            { new: true }
        );
        if (!faq) {
            return res.status(404).json({ success: false, message: "FAQ not found" });
        }
        res.json({ success: true, data: faq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await FAQ.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        if (!faq) {
            return res.status(404).json({ success: false, message: "FAQ not found" });
        }
        res.json({ success: true, message: "FAQ deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
