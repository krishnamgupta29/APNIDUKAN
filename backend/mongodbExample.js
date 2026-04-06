/*
  INSTALL: npm install mongodb dotenv
  RUN: node mongodbExample.js
*/

// Load environment variables from a .env file (if it exists)
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

/**
 * 1. CONFIGURATION
 * We read the MONGODB_URI from environment variables for security.
 * If not found, it fails with a clear message rather than hardcoding a secret.
 */
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI not found in environment variables.");
    console.log("Please create a .env file or export the variable before running.");
    process.exit(1);
}

async function run() {
    /**
     * 2. INITIALIZE CLIENT
     * Use up-to-date MongoClient patterns for Node.js.
     */
    const client = new MongoClient(MONGODB_URI);

    try {
        console.log("--- 🚀 STARTING APNI DUKAAN MONGODB ATLAS DEMO ---");
        
        // Connect to the Atlas Cluster
        console.log("Connecting to MongoDB Atlas...");
        await client.connect();
        console.log("✅ Connection Successful!");

        // Select Database and Collection
        const db = client.db("apni_dukaan_demo");
        const collection = db.collection("demo_inventory");

        // 3. PREPARE DATA
        // inserting 10 realistic e-commerce products with distinct timestamps
        console.log("Preparing to insert 10 realistic products...");
        const now = Date.now();
        const products = [
            { name: "Premium Basmati Rice (5kg)", price: 550, category: "Grocery", stock: 100, createdAt: new Date(now - 86400000 * 5) },
            { name: "Extra Virgin Olive Oil (1L)", price: 950, category: "Grocery", stock: 45, createdAt: new Date(now - 86400000 * 4) },
            { name: "Wireless Bluetooth Earbuds", price: 1299, category: "Electronics", stock: 25, createdAt: new Date(now - 86400000 * 3) },
            { name: "Fast Charging Power Bank", price: 899, category: "Electronics", stock: 60, createdAt: new Date(now - 86400000 * 2) },
            { name: "Cotton Bedspread (King)", price: 1500, category: "Home", stock: 15, createdAt: new Date(now - 86400000 * 1) },
            { name: "Stainless Steel Water Bottle", price: 450, category: "Essentials", stock: 80, createdAt: new Date(now - 43200000) },
            { name: "Adjustable Laptop Stand", price: 750, category: "Office", stock: 30, createdAt: new Date(now - 21600000) },
            { name: "Yoga Mat (Non-slip)", price: 650, category: "Fitness", stock: 50, createdAt: new Date(now - 10800000) },
            { name: "LED Desk Lamp with USB", price: 1100, category: "Home", stock: 20, createdAt: new Date(now - 3600000) },
            { name: "Ceramic Coffee Mug Set", price: 499, category: "Home", stock: 40, createdAt: new Date() }
        ];

        // 4. INSERT DATA
        const insertResult = await collection.insertMany(products);
        console.log(`✅ Successfully inserted ${insertResult.insertedCount} documents into 'demo_inventory'.`);

        /**
         * 5. QUERY: FETCH 5 MOST RECENT DOCUMENTS
         * We sort by 'createdAt' in descending order (-1) to get the latest items.
         */
        console.log("\n--- 🛒 FETCHING 5 MOST RECENTLY ADDED PRODUCTS ---");
        const recentItems = await collection
            .find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        recentItems.forEach((item, index) => {
            console.log(`${index + 1}. [${item.createdAt.toLocaleTimeString()}] ${item.name} - ₹${item.price} (Stock: ${item.stock})`);
        });

        /**
         * 6. QUERY: FETCH ONE DOCUMENT BY _ID
         * Demonstrates how to use MongoDB's ObjectId for precise lookups.
         */
        const firstAddedId = insertResult.insertedIds[0];
        console.log(`\n--- 🔍 FETCHING SPECIFIC PRODUCT BY ID: ${firstAddedId} ---`);
        const foundItem = await collection.findOne({ _id: new ObjectId(firstAddedId) });
        
        if (foundItem) {
            console.log("Full Document Details:");
            console.log(JSON.stringify(foundItem, null, 2));
        } else {
            console.log("⚠️ Document not found.");
        }

    } catch (error) {
        // Basic error handling for connection or query failures
        console.error("\n❌ AN ERROR OCCURRED:");
        console.error(error.message);
    } finally {
        /**
         * 7. CLOSE CONNECTION
         * Always ensure the client is closed to prevent connection leaks.
         */
        console.log("\nClosing connection to Atlas...");
        await client.close();
        console.log("👋 Demo finished successfully!");
    }
}

// Execute the async function
run();
