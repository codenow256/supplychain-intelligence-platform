const mongoose = require("mongoose");

const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const InventoryTransaction = require("../models/InventoryTransaction");
const Supplier = require("../models/Supplier");
const Warehouse = require("../models/Warehouse");

// CREATE
const createShipment = async (req, res) => {
    try {
        const shipment = await Shipment.create(req.body);

        res.status(201).json(shipment);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// READ ALL
const getShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find();

        res.status(200).json(shipments);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// READ ONE
const getShipmentById = async (req, res) => {
    try {
        const shipment = await Shipment.findOne({
            shipmentId: req.params.shipmentId
        });

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        res.status(200).json(shipment);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// UPDATE
const updateShipment = async (req, res) => {
    try {
        const shipment = await Shipment.findOneAndUpdate(
            { shipmentId: req.params.shipmentId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        res.status(200).json(shipment);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// DELETE
const deleteShipment = async (req, res) => {
    try {
        const shipment = await Shipment.findOneAndDelete({
            shipmentId: req.params.shipmentId
        });

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        res.status(200).json({
            message: "Shipment deleted successfully",
            shipment
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ======================================================
// RECEIVE SHIPMENT
// Multi-Document ACID Transaction
// ======================================================

const receiveShipment = async (req, res) => {

    const session = await mongoose.startSession();

    try {

        let transactionResult;

        await session.withTransaction(async () => {

            // --------------------------------------------------
            // 1. Find shipment
            // --------------------------------------------------

            const shipment = await Shipment.findOne({
                shipmentId: req.params.shipmentId
            }).session(session);

            if (!shipment) {
                throw new Error("Shipment not found");
            }


            // --------------------------------------------------
            // 2. Validate shipment state
            // --------------------------------------------------

            if (shipment.status === "delivered") {
                throw new Error(
                    "Shipment has already been received"
                );
            }


            if (
                !["pending", "in_transit", "delayed"]
                    .includes(shipment.status)
            ) {
                throw new Error(
                    `Shipment cannot be received from status: ${shipment.status}`
                );
            }


            // --------------------------------------------------
            // 3. Find corresponding order
            // --------------------------------------------------

            const order = await Order.findOne({
                orderId: shipment.orderId
            }).session(session);

            if (!order) {
                throw new Error(
                    `Order ${shipment.orderId} not found`
                );
            }


            // --------------------------------------------------
            // 4. Validate order
            // --------------------------------------------------

            if (order.status === "cancelled") {
                throw new Error(
                    "Cannot receive shipment for a cancelled order"
                );
            }


            if (!order.items || order.items.length === 0) {
                throw new Error(
                    "Order does not contain any items"
                );
            }


            // --------------------------------------------------
            // 5. Validate supplier and warehouse relationship
            // --------------------------------------------------

            const supplier = await Supplier.findById(
                order.supplierId
            ).session(session);

            const warehouse = await Warehouse.findById(
                order.warehouseId
            ).session(session);


            if (!supplier) {
                throw new Error(
                    "Supplier referenced by order not found"
                );
            }

            if (!warehouse) {
                throw new Error(
                    "Warehouse referenced by order not found"
                );
            }


            if (
                supplier.supplierId !== shipment.supplierId
            ) {
                throw new Error(
                    "Shipment supplier does not match order supplier"
                );
            }


            if (
                warehouse.warehouseId !== shipment.warehouseId
            ) {
                throw new Error(
                    "Shipment warehouse does not match order warehouse"
                );
            }


            // --------------------------------------------------
            // 6. Process every order item
            // --------------------------------------------------

            const inventoryChanges = [];
            const transactionDocuments = [];


            for (const item of order.items) {

                // ----------------------------------------------
                // Find Product using ObjectId reference
                // ----------------------------------------------

                const product = await Product.findById(
                    item.productId
                ).session(session);


                if (!product) {
                    throw new Error(
                        `Product ${item.productId} not found`
                    );
                }


                // ----------------------------------------------
                // Find current inventory
                // ----------------------------------------------

                const inventory = await Inventory.findOne({
                    productId: product.productId,
                    warehouseId: shipment.warehouseId
                }).session(session);


                if (!inventory) {
                    throw new Error(
                        `Inventory record not found for ${product.productId} at ${shipment.warehouseId}`
                    );
                }


                const previousQuantity =
                    inventory.quantity;


                // ----------------------------------------------
                // Increase inventory
                // ----------------------------------------------

                const updatedInventory =
                    await Inventory.findOneAndUpdate(
                        {
                            productId: product.productId,
                            warehouseId: shipment.warehouseId
                        },
                        {
                            $inc: {
                                quantity: item.quantity
                            }
                        },
                        {
                            new: true,
                            session: session
                        }
                    );


                // ----------------------------------------------
                // Prepare inventory transaction
                // ----------------------------------------------

                transactionDocuments.push({
                    transactionId:
                        `REC-${shipment.shipmentId}-${product.productId}-${Date.now()}-${inventoryChanges.length}`,

                    productId:
                        product.productId,

                    warehouseId:
                        shipment.warehouseId,

                    type: "IN",

                    quantity:
                        item.quantity,

                    referenceId:
                        shipment.shipmentId,

                    transactionDate:
                        new Date()
                });


                inventoryChanges.push({
                    productId:
                        product.productId,

                    warehouseId:
                        shipment.warehouseId,

                    previousQuantity:
                        previousQuantity,

                    receivedQuantity:
                        item.quantity,

                    newQuantity:
                        updatedInventory.quantity
                });
            }


            // --------------------------------------------------
            // 7. Create inventory transaction records
            // --------------------------------------------------

            await InventoryTransaction.insertMany(
                transactionDocuments,
                {
                    session: session,
                    ordered: true
                }
            );


            // --------------------------------------------------
            // 8. Mark shipment as delivered
            // --------------------------------------------------

            shipment.status = "delivered";

            shipment.actualDeliveryDate = new Date();

            await shipment.save({
                session: session
            });


            // --------------------------------------------------
            // 9. Result returned after transaction commits
            // --------------------------------------------------

            transactionResult = {
                shipmentId: shipment.shipmentId,

                orderId: shipment.orderId,

                status: shipment.status,

                actualDeliveryDate:
                    shipment.actualDeliveryDate,

                inventoryChanges:
                    inventoryChanges,

                transactionCount:
                    transactionDocuments.length
            };

        });


        // --------------------------------------------------
        // Transaction successfully committed
        // --------------------------------------------------

        res.status(200).json({
            success: true,
            message:
                "Shipment received successfully. Inventory and transaction records updated atomically.",
            data: transactionResult
        });


    } catch (error) {

        console.error(
            "Receive shipment transaction error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                "Shipment receiving transaction failed. All changes were rolled back.",
            error: error.message
        });

    } finally {

        await session.endSession();

    }
};

module.exports = {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipment,
    deleteShipment,
    receiveShipment
};