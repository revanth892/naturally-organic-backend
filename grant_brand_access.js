import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const grantBrandAccess = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const res = await db.collection('users').updateMany(
            { login: { $in: ["superadmin", "ops_mgr"] } },
            { $set: { brandAccess: true } }
        );

        console.log(`Updated ${res.modifiedCount} users with brandAccess`);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

grantBrandAccess();
