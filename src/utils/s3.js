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

export const getPresignedUploadUrl = async (fileName, fileType) => {
    const key = `uploads/${Date.now()}_${fileName}`;
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

const imageFields = [
    "profileImages", "aadharFrontImages", "aadharBackImages", "panCardImages",
    "gstCertificateImages", "shopFrontImages", "pesticideLicenseImages",
    "seedLicenseImages", "fertilizerLicenseImages", "otherDocuments"
];

export const signUserImages = async (user) => {
    if (!user) return user;
    const userObj = user.toObject ? user.toObject() : user;

    for (const field of imageFields) {
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
