const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./src/models/Product");
const Supplier = require("./src/models/Supplier");
const Warehouse = require("./src/models/Warehouse");
const Inventory = require("./src/models/Inventory");
const Order = require("./src/models/Order");
const Shipment = require("./src/models/Shipment");
const InventoryTransaction = require("./src/models/InventoryTransaction");

const DEMO = {
    products: ["P-DEMO-01", "P-DEMO-02", "P-DEMO-03"],
    supplier: "SUP-DEMO-01",
    warehouse: "WH-DEMO-01",
    order: "ORD-DEMO-01",
    shipment: "SHP-DEMO-01"
};

async function seedDemo() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("\n====================================");
        console.log("SUPPLYCHAINIQ DEMO DATA SETUP");
        console.log("====================================\n");

        // =====================================================
        // 1. REMOVE OLD DEMO DATA
        // =====================================================

        console.log("Removing old demo data...");

        await Shipment.deleteOne({
            shipmentId: DEMO.shipment
        });

        await InventoryTransaction.deleteMany({
            referenceId: DEMO.shipment
        });

        await Order.deleteOne({
            orderId: DEMO.order
        });

        await Inventory.deleteMany({
            warehouseId: DEMO.warehouse,
            productId: {
                $in: DEMO.products
            }
        });

        await Product.deleteMany({
            productId: {
                $in: DEMO.products
            }
        });

        await Supplier.deleteOne({
            supplierId: DEMO.supplier
        });

        await Warehouse.deleteOne({
            warehouseId: DEMO.warehouse
        });

        console.log("Old demo data removed.\n");

        // =====================================================
        // 2. SUPPLIER
        // =====================================================

        const supplier = await Supplier.create({
            supplierId: DEMO.supplier,
            name: "Demo Supply Solutions",
            location: "Chennai",
            leadTimeDays: 7,
            contactEmail: "demo-supplier@supplychainiq.com",
            status: "active"
        });

        console.log("Supplier created:", supplier.supplierId);

        // =====================================================
        // 3. WAREHOUSE
        // =====================================================

        const warehouse = await Warehouse.create({
            warehouseId: DEMO.warehouse,
            name: "Demo Central Warehouse",
            location: "Chennai",
            capacity: 10000,
            status: "active"
        });

        console.log("Warehouse created:", warehouse.warehouseId);

        // =====================================================
        // 4. PRODUCTS
        // =====================================================

        const products = await Product.insertMany([
            {
                productId: "P-DEMO-01",
                name: "Demo Electronic Component",
                sku: "SKU-DEMO-01",
                category: "Electronics",
                unitPrice: 1000,
                reorderLevel: 25,
                status: "active"
            },
            {
                productId: "P-DEMO-02",
                name: "Demo Industrial Component",
                sku: "SKU-DEMO-02",
                category: "Industrial",
                unitPrice: 1500,
                reorderLevel: 30,
                status: "active"
            },
            {
                productId: "P-DEMO-03",
                name: "Demo Packaging Component",
                sku: "SKU-DEMO-03",
                category: "Packaging",
                unitPrice: 500,
                reorderLevel: 15,
                status: "active"
            }
        ]);

        console.log(
            "Products created:",
            products.map(p => p.productId).join(", ")
        );

        // =====================================================
        // 5. INITIAL INVENTORY
        // =====================================================

        await Inventory.insertMany([
            {
                productId: "P-DEMO-01",
                warehouseId: DEMO.warehouse,
                quantity: 50,
                reorderLevel: 25
            },
            {
                productId: "P-DEMO-02",
                warehouseId: DEMO.warehouse,
                quantity: 80,
                reorderLevel: 30
            },
            {
                productId: "P-DEMO-03",
                warehouseId: DEMO.warehouse,
                quantity: 30,
                reorderLevel: 15
            }
        ]);

        console.log("Inventory created:");
        console.log("  P-DEMO-01 = 50");
        console.log("  P-DEMO-02 = 80");
        console.log("  P-DEMO-03 = 30");

        // =====================================================
        // 6. ORDER
        // =====================================================

        const orderDate = new Date();
        const expectedDeliveryDate = new Date(orderDate);

        expectedDeliveryDate.setDate(
            expectedDeliveryDate.getDate() + 7
        );

        const order = await Order.create({
            orderId: DEMO.order,

            supplierId: supplier._id,

            warehouseId: warehouse._id,

            items: [
                {
                    productId: products[0]._id,
                    quantity: 20,
                    unitPrice: products[0].unitPrice
                },
                {
                    productId: products[1]._id,
                    quantity: 15,
                    unitPrice: products[1].unitPrice
                },
                {
                    productId: products[2]._id,
                    quantity: 10,
                    unitPrice: products[2].unitPrice
                }
            ],

            orderDate: orderDate,

            expectedDeliveryDate: expectedDeliveryDate,

            status: "confirmed"
        });

        console.log("\nOrder created:", order.orderId);

        // =====================================================
        // 7. SHIPMENT
        // =====================================================

        const shipment = await Shipment.create({
            shipmentId: DEMO.shipment,

            orderId: order.orderId,

            supplierId: supplier.supplierId,

            warehouseId: warehouse.warehouseId,

            shippedDate: orderDate,

            expectedDeliveryDate: expectedDeliveryDate,

            actualDeliveryDate: null,

            status: "in_transit"
        });

        console.log("Shipment created:", shipment.shipmentId);

        // =====================================================
        // 8. VALIDATION
        // =====================================================

        console.log("\n====================================");
        console.log("VALIDATING DEMO DATA");
        console.log("====================================\n");

        const savedProducts = await Product.find({
            productId: {
                $in: DEMO.products
            }
        });

        const savedInventory = await Inventory.find({
            warehouseId: DEMO.warehouse,
            productId: {
                $in: DEMO.products
            }
        });

        const savedOrder = await Order.findOne({
            orderId: DEMO.order
        });

        const savedShipment = await Shipment.findOne({
            shipmentId: DEMO.shipment
        });

        // -----------------------------------------------------
        // Validation 1
        // -----------------------------------------------------

        if (savedProducts.length !== 3) {
            throw new Error(
                `Expected 3 demo products, found ${savedProducts.length}`
            );
        }

        // -----------------------------------------------------
        // Validation 2
        // -----------------------------------------------------

        if (savedInventory.length !== 3) {
            throw new Error(
                `Expected 3 inventory records, found ${savedInventory.length}`
            );
        }

        // -----------------------------------------------------
        // Validation 3
        // -----------------------------------------------------

        if (!savedOrder) {
            throw new Error("Demo order was not created.");
        }

        if (savedOrder.items.length !== 3) {
            throw new Error(
                `Expected 3 order items, found ${savedOrder.items.length}`
            );
        }

        // -----------------------------------------------------
        // Validation 4
        // -----------------------------------------------------

        if (!savedShipment) {
            throw new Error("Demo shipment was not created.");
        }

        // -----------------------------------------------------
        // Validation 5
        // -----------------------------------------------------

        if (savedShipment.status !== "in_transit") {
            throw new Error(
                `Expected shipment status in_transit, found ${savedShipment.status}`
            );
        }

        // -----------------------------------------------------
        // Validation 6
        // -----------------------------------------------------

        const inventoryCheck = await Inventory.find({
            warehouseId: DEMO.warehouse
        });

        const expectedQuantities = {
            "P-DEMO-01": 50,
            "P-DEMO-02": 80,
            "P-DEMO-03": 30
        };

        for (const item of inventoryCheck) {
            if (
                expectedQuantities[item.productId] !==
                item.quantity
            ) {
                throw new Error(
                    `Unexpected quantity for ${item.productId}`
                );
            }
        }

        // =====================================================
        // FINAL SUCCESS
        // =====================================================

        console.log("\n====================================");
        console.log("DEMO DATA READY");
        console.log("====================================\n");

        console.log("Supplier :", DEMO.supplier);
        console.log("Warehouse:", DEMO.warehouse);
        console.log("Products :", DEMO.products.join(", "));
        console.log("Order    :", DEMO.order);
        console.log("Shipment :", DEMO.shipment);

        console.log("\nBEFORE RECEIVE:");
        console.log("P-DEMO-01 -> 50");
        console.log("P-DEMO-02 -> 80");
        console.log("P-DEMO-03 -> 30");

        console.log("\nShipment status -> in_transit");
        console.log("Inventory transactions for this shipment -> 0");

        console.log("\n====================================");
        console.log("ALL DEMO VALIDATIONS PASSED");
        console.log("====================================\n");

    } catch (error) {
        console.error("\n====================================");
        console.error("DEMO SEED FAILED");
        console.error("====================================\n");

        console.error(error.message);

        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
}

seedDemo();