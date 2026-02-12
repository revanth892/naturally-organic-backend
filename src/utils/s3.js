import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.WASABI_REGION || "us-east-1";
const endpoint = process.env.WASABI_ENDPOINT || "https://s3.wasabisys.com";
const accessKeyId = process.env.WASABI_ACCESS_KEY;
const secretAccessKey = process.env.WASABI_SECRET_KEY;
const bucketName = process.env.WASABI_BUCKET;

const s3Client = new S3Client({
    region,
    endpoint,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    forcePathStyle: true,
});

export const getPresignedUploadUrl = async (fileName, fileType, folder = "uploads") => {
    const key = `${folder}/${Date.now()}_${fileName}`;
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: fileType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { url, key };
};

export const getPresignedThumbnailUploadUrl = async (fileName, fileType) => {
    const key = `thumbnails/${Date.now()}_thumb_${fileName}`;
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: fileType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { url, key };
};

export const getFileUrl = (key) => {
    return `${endpoint}/${bucketName}/${key}`;
};

export const getSignedDownloadUrl = async (key) => {
    if (!key) return null;
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 }); // 24 hours
        return url;
    } catch (err) {
        console.error("Error signing URL:", err);
        return null;
    }
};

const userImageFields = [
    "profileImages", "aadharFrontImages", "aadharBackImages", "panCardImages",
    "gstCertificateImages", "shopFrontImages", "pesticideLicenseImages",
    "seedLicenseImages", "fertilizerLicenseImages", "otherDocuments"
];

export const signUserImages = async (user) => {
    if (!user) return user;
    const userObj = user.toObject ? user.toObject() : user;

    for (const field of userImageFields) {
        if (userObj[field] && Array.isArray(userObj[field])) {
            const signedImages = await Promise.all(
                userObj[field].map(async (img) => {
                    const signedUrl = await getSignedDownloadUrl(img.key);
                    return {
                        ...img,
                        link: signedUrl || img.link,
                    };
                })
            );
            userObj[field] = signedImages;
        }
    }
    return userObj;
};

export const signProductImages = async (product, onlyFirst = false) => {
    if (!product) return product;
    const productObj = product.toObject ? product.toObject() : product;

    if (productObj.images && Array.isArray(productObj.images) && productObj.images.length > 0) {
        if (onlyFirst) {
            // Only sign the first image (faster for list views)
            const firstImg = productObj.images[0];
            // Use thumbnail key if available, otherwise fallback to full image key
            const keyToSign = firstImg.thumbnailKey || firstImg.key;
            const signedUrl = await getSignedDownloadUrl(keyToSign);

            productObj.images = [{
                ...firstImg,
                location: signedUrl || firstImg.location,
            }];
        } else {
            // Sign all images (for detail view)
            const signedImages = await Promise.all(
                productObj.images.map(async (img) => {
                    const signedUrl = await getSignedDownloadUrl(img.key);
                    return {
                        ...img,
                        location: signedUrl || img.location,
                    };
                })
            );
            productObj.images = signedImages;
        }
    }
    return productObj;
};

export const signCategoryImages = async (category) => {
    if (!category) return category;
    const categoryObj = category.toObject ? category.toObject() : category;

    if (categoryObj.image && categoryObj.image.key) {
        // Prefer thumbnail key if available
        const keyToSign = categoryObj.image.thumbnailKey || categoryObj.image.key;
        const signedUrl = await getSignedDownloadUrl(keyToSign);
        categoryObj.image.location = signedUrl || categoryObj.image.location;
    }
    return categoryObj;
};

export const signSubcategoryImages = async (subcategory) => {
    if (!subcategory) return subcategory;
    const subcategoryObj = subcategory.toObject ? subcategory.toObject() : subcategory;

    if (subcategoryObj.image && subcategoryObj.image.key) {
        // Prefer thumbnail key if available
        const keyToSign = subcategoryObj.image.thumbnailKey || subcategoryObj.image.key;
        const signedUrl = await getSignedDownloadUrl(keyToSign);
        subcategoryObj.image.location = signedUrl || subcategoryObj.image.location;
    }
    return subcategoryObj;
};

export const signBrandImages = async (brand) => {
    if (!brand) return brand;
    const brandObj = brand.toObject ? brand.toObject() : brand;

    if (brandObj.image && brandObj.image.key) {
        // Prefer thumbnail key if available
        const keyToSign = brandObj.image.thumbnailKey || brandObj.image.key;
        const signedUrl = await getSignedDownloadUrl(keyToSign);
        brandObj.image.location = signedUrl || brandObj.image.location;
    }
    return brandObj;
};

export const signChildCategoryImages = async (childCategory) => {
    if (!childCategory) return childCategory;
    const childCategoryObj = childCategory.toObject ? childCategory.toObject() : childCategory;

    if (childCategoryObj.image && childCategoryObj.image.key) {
        // Prefer thumbnail key if available
        const keyToSign = childCategoryObj.image.thumbnailKey || childCategoryObj.image.key;
        const signedUrl = await getSignedDownloadUrl(keyToSign);
        childCategoryObj.image.location = signedUrl || childCategoryObj.image.location;
    }
    return childCategoryObj;
};

