const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Product = require("./models/Product");
const Supplier = require("./models/Supplier");
const Warehouse = require("./models/Warehouse");
const Inventory = require("./models/Inventory");
const Order = require("./models/Order");
const Shipment = require("./models/Shipment");
const InventoryTransaction = require("./models/InventoryTransaction");

// ---------- Helper Functions ----------

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack = 365) {
    const date = new Date();
    date.setDate(
        date.getDate() - randomNumber(0, daysBack)
    );
    return date;
}

// ---------- Main Seed Function ----------

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("MongoDB connected.");

        // =====================================================
        // 1. PRODUCTS
        // =====================================================

        const productCount = await Product.countDocuments();

        let products = await Product.find();

        if (productCount === 0) {
            const productData = [];

            const categories = [
                "Electronics",
                "Automotive",
                "Hardware",
                "Packaging",
                "Industrial"
            ];

            for (let i = 1; i <= 50; i++) {
                productData.push({
                    productId: `P${String(i).padStart(3, "0")}`,
                    name: `Product ${i}`,
                    sku: `SKU-${String(i).padStart(3, "0")}`,
                    category: randomItem(categories),
                    unitPrice: randomNumber(500, 10000),
                    reorderLevel: randomNumber(10, 100),
                    status: "active"
                });
            }

            products = await Product.insertMany(productData);

            console.log(`Products created: ${products.length}`);
        } else {
            console.log(`Products already exist: ${products.length}`);
        }

        // =====================================================
        // 2. SUPPLIERS
        // =====================================================

        const supplierCount = await Supplier.countDocuments();

        let suppliers = await Supplier.find();

        if (supplierCount === 0) {
            const supplierData = [];

            const locations = [
                "Chennai",
                "Bangalore",
                "Hyderabad",
                "Mumbai",
                "Pune",
                "Delhi"
            ];

            for (let i = 1; i <= 20; i++) {
                supplierData.push({
                    supplierId: `SUP${String(i).padStart(3, "0")}`,
                    name: `Supplier ${i}`,
                    location: randomItem(locations),
                    leadTimeDays: randomNumber(2, 20),
                    contactEmail: `supplier${i}@example.com`,
                    status: "active"
                });
            }

            suppliers = await Supplier.insertMany(supplierData);

            console.log(`Suppliers created: ${suppliers.length}`);
        } else {
            console.log(`Suppliers already exist: ${suppliers.length}`);
        }

        // =====================================================
        // 3. WAREHOUSES
        // =====================================================

        const warehouseCount = await Warehouse.countDocuments();

        let warehouses = await Warehouse.find();

        if (warehouseCount === 0) {
            const warehouseData = [];

            const locations = [
                "Chennai",
                "Bangalore",
                "Hyderabad",
                "Mumbai",
                "Pune",
                "Delhi"
            ];

            for (let i = 1; i <= 10; i++) {
                warehouseData.push({
                    warehouseId: `WH${String(i).padStart(3, "0")}`,
                    name: `Warehouse ${i}`,
                    location: randomItem(locations),
                    capacity: randomNumber(5000, 20000),
                    status: "active"
                });
            }

            warehouses = await Warehouse.insertMany(warehouseData);

            console.log(`Warehouses created: ${warehouses.length}`);
        } else {
            console.log(`Warehouses already exist: ${warehouses.length}`);
        }

        // =====================================================
        // 4. INVENTORY
        // =====================================================

        const inventoryCount = await Inventory.countDocuments();

        if (inventoryCount === 0) {
            const inventoryData = [];

            for (const product of products) {
                // Put each product in several warehouses
                const selectedWarehouses = warehouses
                    .sort(() => 0.5 - Math.random())
                    .slice(0, randomNumber(3, 5));

                for (const warehouse of selectedWarehouses) {
                    const reorderLevel = product.reorderLevel;

                    inventoryData.push({
                        productId: product.productId,
                        warehouseId: warehouse.warehouseId,
                        quantity: randomNumber(0, 200),
                        reorderLevel: reorderLevel
                    });
                }
            }

            await Inventory.insertMany(inventoryData);

            console.log(`Inventory records created: ${inventoryData.length}`);
        } else {
            console.log(`Inventory already exists: ${inventoryCount}`);
        }

        // =====================================================
        // 5. ORDERS
        // =====================================================

        const orderCount = await Order.countDocuments();

        let orders = await Order.find();

        if (orderCount === 0) {
            const orderData = [];

            for (let i = 1; i <= 5000; i++) {
                const supplier = randomItem(suppliers);
                const warehouse = randomItem(warehouses);

                const numberOfItems = randomNumber(1, 4);
                const items = [];

                for (let j = 0; j < numberOfItems; j++) {
                    const product = randomItem(products);

                    items.push({
                        productId: product._id,
                        quantity: randomNumber(1, 100),
                        unitPrice: product.unitPrice
                    });
                }

                const orderDate = randomDate(365);

                const expectedDeliveryDate = new Date(orderDate);
                expectedDeliveryDate.setDate(
                    expectedDeliveryDate.getDate() +
                    randomNumber(3, 20)
                );

                orderData.push({
                    orderId: `ORD${String(i).padStart(5, "0")}`,

                    // IMPORTANT:
                    // Order uses ObjectId references
                    supplierId: supplier._id,
                    warehouseId: warehouse._id,

                    // Embedded items
                    items: items,

                    orderDate: orderDate,

                    expectedDeliveryDate:
                        expectedDeliveryDate,

                    status: randomItem([
                        "pending",
                        "confirmed",
                        "completed"
                    ])
                });
            }

            orders = await Order.insertMany(orderData);

            console.log(`Orders created: ${orders.length}`);
        } else {
            console.log(`Orders already exist: ${orders.length}`);
        }

        // =====================================================
        // 6. SHIPMENTS
        // =====================================================

        const shipmentCount = await Shipment.countDocuments();

        let shipments = await Shipment.find();

        if (shipmentCount === 0) {
            const shipmentData = [];

            for (const order of orders) {

                // Order contains ObjectId references.
                // Convert them back to the business IDs expected
                // by the Shipment schema.

                const supplier = suppliers.find(
                    s => s._id.equals(order.supplierId)
                );

                const warehouse = warehouses.find(
                    w => w._id.equals(order.warehouseId)
                );

                if (!supplier || !warehouse) {
                    continue;
                }

                const isDelivered =
                    order.status === "completed";

                let actualDeliveryDate = null;
                let shipmentStatus = "pending";

                if (isDelivered) {
                    actualDeliveryDate = new Date(
                        order.expectedDeliveryDate
                    );

                    // Some shipments arrive late
                    actualDeliveryDate.setDate(
                        actualDeliveryDate.getDate() +
                        randomNumber(-2, 8)
                    );

                    if (
                        actualDeliveryDate >
                        order.expectedDeliveryDate
                    ) {
                        shipmentStatus = "delayed";
                    } else {
                        shipmentStatus = "delivered";
                    }
                } else {
                    shipmentStatus = randomItem([
                        "pending",
                        "in_transit"
                    ]);
                }

                shipmentData.push({
                    shipmentId: `SHP-${order.orderId}`,

                    // Shipment uses String IDs
                    orderId: order.orderId,
                    supplierId: supplier.supplierId,
                    warehouseId: warehouse.warehouseId,

                    shippedDate: order.orderDate,

                    expectedDeliveryDate:
                        order.expectedDeliveryDate,

                    actualDeliveryDate:
                        actualDeliveryDate,

                    status: shipmentStatus
                });
            }

            shipments = await Shipment.insertMany(shipmentData);

            console.log(`Shipments created: ${shipments.length}`);
        } else {
            console.log(`Shipments already exist: ${shipments.length}`);
        }

        // =====================================================
        // 7. INVENTORY TRANSACTIONS
        // =====================================================

        const transactionCount =
            await InventoryTransaction.countDocuments();

        if (transactionCount === 0) {

            const transactionData = [];

            for (let i = 1; i <= 20000; i++) {

                const product = randomItem(products);
                const warehouse = randomItem(warehouses);

                const type = randomItem([
                    "IN",
                    "OUT",
                    "ADJUSTMENT"
                ]);

                let referenceId;

                if (type === "OUT" && orders.length > 0) {
                    const order = randomItem(orders);
                    referenceId = order.orderId;
                } else if (type === "IN" && shipments.length > 0) {
                    const shipment = randomItem(shipments);
                    referenceId = shipment.shipmentId;
                } else {
                    referenceId = `ADJ-${i}`;
                }

                transactionData.push({
                    transactionId:
                        `SEED-TXN-${String(i).padStart(5, "0")}`,

                    // IMPORTANT:
                    // InventoryTransaction uses String IDs
                    productId: product.productId,
                    warehouseId: warehouse.warehouseId,

                    type: type,

                    quantity: randomNumber(1, 50),

                    referenceId: referenceId,

                    transactionDate: randomDate(365)
                });
            }

            // insertMany is much more efficient than calling
            // create() 20,000 times individually.
            await InventoryTransaction.insertMany(
                transactionData
            );

            console.log(
                `Inventory transactions created: ${transactionData.length}`
            );
        } else {
            console.log(
                `Inventory transactions already exist: ${transactionCount}`
            );
        }

        // =====================================================
        // FINAL SUMMARY
        // =====================================================

        console.log("\n========== SEED COMPLETE ==========");

        console.log(
            "Products:",
            await Product.countDocuments()
        );

        console.log(
            "Suppliers:",
            await Supplier.countDocuments()
        );

        console.log(
            "Warehouses:",
            await Warehouse.countDocuments()
        );

        console.log(
            "Inventory:",
            await Inventory.countDocuments()
        );

        console.log(
            "Orders:",
            await Order.countDocuments()
        );

        console.log(
            "Shipments:",
            await Shipment.countDocuments()
        );

        console.log(
            "Inventory Transactions:",
            await InventoryTransaction.countDocuments()
        );

        console.log("===================================\n");

    } catch (error) {
        console.error("SEED ERROR:", error);
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
}

seedDatabase();