
const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const Inventory = require("../models/Inventory");

async function addInventoryValidation() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    const collectionName = Inventory.collection.name;
    const db = mongoose.connection.db;

    await db.command({
      collMod: collectionName,
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [
            "productId",
            "warehouseId",
            "quantity",
            "reorderLevel"
          ],
          properties: {
            productId: {
              bsonType: "string",
              description: "Product ID must be a string"
            },
            warehouseId: {
              bsonType: "string",
              description: "Warehouse ID must be a string"
            },
            quantity: {
              bsonType: ["int", "long", "double", "decimal"],
              minimum: 0,
              description: "Quantity must be a non-negative number"
            },
            reorderLevel: {
              bsonType: ["int", "long", "double", "decimal"],
              minimum: 0,
              description: "Reorder level must be a non-negative number"
            }
          }
        }
      },
      validationLevel: "moderate",
      validationAction: "error"
    });

    console.log(`Schema validation enabled on ${collectionName}`);
  } catch (error) {
    console.error("Validation setup failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

addInventoryValidation();
