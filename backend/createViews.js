const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const createViews = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("MongoDB connected.");

        const db = mongoose.connection.db;

        // Remove existing view if it exists
        const collections = await db
            .listCollections({ name: "low_stock_inventory" })
            .toArray();

        if (collections.length > 0) {
            await db.collection("low_stock_inventory").drop();
            console.log("Existing low_stock_inventory view removed.");
        }

        // Create MongoDB View
        await db.createCollection(
            "low_stock_inventory",
            {
                viewOn: "inventories",
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $lte: [
                                    "$quantity",
                                    "$reorderLevel"
                                ]
                            }
                        }
                    },
                    {
                        $addFields: {
                            stockGap: {
                                $subtract: [
                                    "$quantity",
                                    "$reorderLevel"
                                ]
                            },
                            riskLevel: "HIGH"
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            productId: 1,
                            warehouseId: 1,
                            quantity: 1,
                            reorderLevel: 1,
                            stockGap: 1,
                            riskLevel: 1
                        }
                    }
                ]
            }
        );

        console.log("MongoDB View created successfully.");

        // Verify the view
        const results = await db
            .collection("low_stock_inventory")
            .find({})
            .limit(10)
            .toArray();

        console.log("\nLOW STOCK VIEW RESULTS:");
        console.log(results);

        console.log("\nFeature 7 View is working.");

    } catch (error) {
        console.error("View creation failed:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

createViews();