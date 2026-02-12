import mongoose from "mongoose";
import dotenv from "dotenv";
import Brand from "../models/brand.model.js";

dotenv.config();

const brands = [
    "A1 Snacks", "A2B", "AAA RICE", "Aachi", "Aani", "Aashirvaad", "Absolut", "Aero", "Ahaa", "Ajmi", "Ajwa",
    "Amaravathi", "Amritha", "Amruth", "Amrutanjan", "Amul", "Anil", "Anna Luxmy", "Annas", "Anuved",
    "Appletiser", "Aqua Pura", "Araliya", "Ashoka", "Ayouth Veda", "Ayumi", "B Natural", "Babu Laxminarayana",
    "Bacardi", "Bacofoil", "Badshah", "Bajaj", "Balah", "Balaji", "Bambino", "Bigen", "Bikaji", "Biona",
    "Boost", "Bounty", "Breezer", "Britannia", "Brokebond", "Bru", "BTM", "Budweiser", "Buzzballz",
    "Coke", "Cadbury", "Catergold", "Centrefruit", "Ceylon", "Chings", "Chivas", "Chupa Chups", "Cinthol",
    "Clipper", "Colgate", "Crispy Roti", "Cycle", "Daily Delight", "D & I", "Daawat", "Dabur", "Dairy Valley",
    "Desi", "East End", "Eastern", "Elakkia", "Elephant House", "Eno", "Everest", "Eytex", "Fair & Lovely",
    "Fairy", "Fanta", "Fosters", "Fudco", "Garvi Gujarat", "GIF", "Girnar", "GITS", "Grace", "GRB",
    "Greenfields", "Hajmola", "Haldirams", "Harishandra", "Heera", "Heineken", "Heinz", "Hesh", "Himalaya",
    "Horlicks", "ID", "Idhayam", "Indiagate", "Indri", "Inndu Sri", "Jabsons", "Jak Daniels", "Jaimin",
    "Jalaram", "Jalpur", "Kailas Bhel", "Kamadhenu", "Karachi", "Kashmira", "Kaveri", "Khushi", "King Fisher",
    "Kissan", "Kit Kat", "Kohinoor", "Krishna", "Kurkure", "Kwality", "Laila", "Lancashire", "Laxminarayan",
    "Lays", "Lijjat", "Limca", "Maaza", "Madurai Meenakshi", "Maggi", "Malabar Choice", "Maliban", "Malli",
    "Mangaldeep", "Mansion House", "MD", "MDH", "Medimix", "MoguMou", "Mr Naga", "MTR", "Mysore Sandal",
    "Naga", "Natco", "Natracare", "Natural", "Nescafe", "Nestle", "Niharti", "Niru", "Nkulenus", "Old Monk",
    "Padmini", "Parachute", "Parle", "Pataks", "Patanjali", "Pears", "Pepsi", "Periyar", "PG Tips",
    "Pillsbury", "Priya", "Pukka", "Rajah", "Ramdev", "Redbull", "Rishta", "Saffola", "sahana", "Sakthi",
    "Samyang", "Sapna", "Santoor", "Saras", "Sat Iasbgol", "Satco", "Savorit", "Saxa", "Schweppes",
    "Shan", "Shana", "Shankar", "Shivi", "Shree Krishna", "Smirnoff", "Southern Grains", "Sprite",
    "Stella Artois", "Sumeru", "Sunfeast", "Suvai", "Tate & Lyle", "Tata", "Telugu Foods", "Thumps Up",
    "Tilda", "Top-op", "Town Bus", "TRS", "Udhaiyam", "Uncle Chips", "Uthra", "Vandevi", "Vedaone",
    "Vidhya", "Viswas", "Volvic", "Wagh Bakri", "Weikfield", "Yippee", "Yogi Tea", "Zandu Balm"
];

const seedBrands = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        for (const name of brands) {
            await Brand.findOneAndUpdate(
                { name },
                { name },
                { upsert: true, new: true }
            );
        }

        console.log("Brands seeded successfully");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding brands:", err);
        process.exit(1);
    }
};

seedBrands();
