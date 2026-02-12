import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const brands = [
    "A1 Snacks", "A2B", "AAA RICE", "Aachi", "Aani", "Aashirvaad", "Absolut", "Aero", "Ahaa", "Ajmi",
    "Ajwa", "Amaravathi", "Amritha", "Amruth", "Amrutanjan", "Amul", "Anil", "Anna Luxmy", "Annas", "Anuved",
    "Appletiser", "Aqua Pura", "Araliya", "Ashoka", "Ayouth Veda", "Ayumi", "B Natural", "Babu Laxminarayana",
    "Bacardi", "Bacofoil", "Badshah", "Bajaj", "Balah", "Balaji", "Bambino", "Bigen", "Bikaji", "Biona",
    "Boost", "Bounty", "Breezer", "Britannia", "Brokebond", "Bru", "BTM", "Budweiser", "Buzzballz", "Coke",
    "Cadbury", "Catergold", "Centrefruit", "Ceylon", "Chings", "Chivas", "Chupa Chups", "Cinthol", "Clipper",
    "Colgate", "Crispy Roti", "Cycle", "Daily Delight", "D & I", "Daawat", "Dabur", "Dairy Valley", "Desi",
    "East End", "Eastern", "Elakkia", "Elephant House", "Eno", "Everest", "Eytex", "Fair & Lovely", "Fairy",
    "Fanta", "Fosters", "Fudco", "Garvi Gujarat", "GIF", "Girnar", "GITS", "Grace", "GRB", "Greenfields",
    "Hajmola", "Haldirams", "Harishandra", "Heera", "Heineken", "Heinz", "Hesh", "Himalaya", "Horlicks", "ID",
    "Idhayam", "Indiagate", "Indri", "Inndu Sri", "Jabsons", "Jak Daniels", "Jaimin", "Jalaram", "Jalpur",
    "Kailas Bhel", "Kamadhenu", "Karachi", "Kashmira", "Kaveri", "Khushi", "King Fisher", "Kissan", "Kit Kat",
    "Kohinoor", "Krishna", "Kurkure", "Kwality", "Laila", "Lancashire", "Laxminarayan", "Lays", "Lijjat",
    "Limca", "Maaza", "Madurai Meenakshi", "Maggi", "Malabar Choice", "Maliban", "Malli", "Mangaldeep",
    "Mansion House", "MD", "MDH", "Medimix", "MoguMou", "Mr Naga", "MTR", "Mysore Sandal", "Naga", "Natco",
    "Natracare", "Natural", "Nescafe", "Nestle", "Niharti", "Niru", "Nkulenus", "Old Monk", "Padmini",
    "Parachute", "Parle", "Pataks", "Patanjali", "Pears", "Pepsi", "Periyar", "PG Tips", "Pillsbury", "Priya",
    "Pukka", "Rajah", "Ramdev", "Redbull", "Rishta", "Saffola", "sahana", "Sakthi", "Samyang", "Sapna",
    "Santoor", "Saras", "Sat Iasbgol", "Satco", "Savorit", "Saxa", "Schweppes", "Shan", "Shana",
    "Shankar", "Shivi", "Shree Krishna", "Smirnoff", "Southern Grains", "Sprite", "Stella Artois", "Sumeru",
    "Sunfeast", "Suvai", "Tate & Lyle", "Tata", "Telugu Foods", "Thumps Up", "Tilda", "Top-op", "Town Bus",
    "TRS", "Udhaiyam", "Uncle Chips", "Uthra", "Vandevi", "Vedaone", "Vidhya", "Viswas", "Volvic", "Wagh Bakri",
    "Weikfield", "Yippee", "Yogi Tea", "Zandu Balm", "Naturally Organic"
];

const seedBrands = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env");
        }

        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB...\n");

        const db = mongoose.connection.db;

        // Delete all existing brands
        const deleteResult = await db.collection('brands').deleteMany({});
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing brands\n`);

        // Insert new brands
        const brandDocuments = brands.map(name => ({
            name: name,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        const insertResult = await db.collection('brands').insertMany(brandDocuments);
        console.log(`✅ Successfully added ${insertResult.insertedCount} brands!\n`);

        console.log("Sample brands added:");
        brands.slice(0, 10).forEach((brand, index) => {
            console.log(`  ${index + 1}. ${brand}`);
        });
        console.log(`  ... and ${brands.length - 10} more brands\n`);

        console.log(`🎉 Total brands in database: ${brands.length}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

seedBrands();
