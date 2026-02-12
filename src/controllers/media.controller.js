import { getPresignedUploadUrl, getPresignedThumbnailUploadUrl, getFileUrl, getSignedDownloadUrl } from "../utils/s3.js";

export const generatePresignedUrl = async (req, res) => {
    try {
        const { fileName, fileType, type } = req.query;
        if (!fileName || !fileType) {
            return res.status(400).json({ success: false, error: "fileName and fileType are required" });
        }

        let result;
        if (type === 'thumbnail') {
            result = await getPresignedThumbnailUploadUrl(fileName, fileType);
        } else {
            result = await getPresignedUploadUrl(fileName, fileType, type || "uploads");
        }

        const { url, key } = result;
        const viewUrl = await getSignedDownloadUrl(key);

        res.json({
            success: true,
            data: {
                uploadUrl: url,
                key,
                viewUrl: viewUrl || getFileUrl(key)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
