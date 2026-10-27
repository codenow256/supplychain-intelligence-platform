
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env")
});

async function runDemo() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    const db = mongoose.connection.db;
    const collectionName = "inventory_integrity_demo";

    // Recreate ONLY this isolated demonstration collection.
    const existing = await db
      .listCollections({ name: collectionName })
      .hasNext();

    if (existing) {
      await db.collection(collectionName).drop();
    }

    // Strict database-level schema validation.
    await db.createCollection(collectionName, {
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
              minLength: 1,
              description: "Product ID is required"
            },
            warehouseId: {
              bsonType: "string",
              minLength: 1,
              description: "Warehouse ID is required"
            },
            quantity: {
              bsonType: ["int", "long", "double", "decimal"],
              minimum: 0,
              description: "Stock cannot be negative"
            },
            reorderLevel: {
              bsonType: ["int", "long", "double", "decimal"],
              minimum: 0,
              description: "Reorder level cannot be negative"
            }
          }
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    const inventory = db.collection(collectionName);

    // Test 1: Valid inventory document.
    await inventory.insertOne({
      productId: "P-DEMO-VALID",
      warehouseId: "WH-DEMO-01",
      quantity: 100,
      reorderLevel: 20
    });
    console.log("PASS: Valid inventory accepted");

    // Test 2: Negative stock.
    await testCase(inventory, "Negative quantity", {
      productId: "P-TEST-1",
      warehouseId: "WH-DEMO-01",
      quantity: -5,
      reorderLevel: 10
    });

    // Test 3: Missing required field.
    await testCase(inventory, "Missing reorderLevel", {
      productId: "P-TEST-2",
      warehouseId: "WH-DEMO-01",
      quantity: 10
    });

    // Test 4: Wrong BSON type.
    await testCase(inventory, "Quantity supplied as text", {
      productId: "P-TEST-3",
      warehouseId: "WH-DEMO-01",
      quantity: "fifty",
      reorderLevel: 10
    });

    // Test 5: Invalid update to a valid document.
    const validRecord = await inventory.findOne({
      productId: "P-DEMO-VALID"
    });

    try {
      await inventory.updateOne(
        { _id: validRecord._id },
        { $set: { quantity: -100 } }
      );
      console.log("FAIL: Invalid update was accepted");
    } catch (error) {
      console.log("PASS: Invalid update rejected by MongoDB");
      console.log("Reason:", error.codeName || error.message);
    }

    console.log(
      "Final valid document:",
      await inventory.findOne({ productId: "P-DEMO-VALID" })
    );
  } catch (error) {
    console.error("Demo setup failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

async function testCase(collection, label, document) {
  try {
    await collection.insertOne(document);
    console.log(`FAIL: ${label} was accepted`);
  } catch (error) {
    console.log(`PASS: ${label} rejected by MongoDB`);
    console.log("Reason:", error.codeName || error.message);
  }
}

runDemo();
