const mongoose = require("mongoose");
const Inventory = require("../models/Inventory");
const InventoryTransaction = require("../models/InventoryTransaction");

const createInventory = async (req, res) => {
    try {
        const inventory = await Inventory.create(req.body);
        res.status(201).json(inventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find();
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInventoryById = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id);

        if (!inventory) {
            return res.status(404).json({
                message: "Inventory record not found"
            });
        }

        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateInventory = async (req, res) => {
    try {
        const inventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!inventory) {
            return res.status(404).json({
                message: "Inventory record not found"
            });
        }

        res.status(200).json(inventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteInventory = async (req, res) => {
    try {
        const inventory = await Inventory.findByIdAndDelete(
            req.params.id
        );

        if (!inventory) {
            return res.status(404).json({
                message: "Inventory record not found"
            });
        }

        res.status(200).json({
            message: "Inventory deleted successfully",
            inventory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const batchAdjustInventory = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { adjustments } = req.body;

        if (!Array.isArray(adjustments) || adjustments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "adjustments must be a non-empty array"
            });
        }

        if (adjustments.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Maximum 100 adjustments allowed"
            });
        }

        const batchId = `BATCH-ADJ-${Date.now()}`;
        let resultData;

        await session.withTransaction(async () => {
            const operations = [];
            const transactionDocuments = [];
            const changes = [];

            const seen = new Set();

            for (let i = 0; i < adjustments.length; i++) {
                const adjustment = adjustments[i];

                const {
                    productId,
                    warehouseId,
                    quantity,
                    direction
                } = adjustment;

                if (
                    !productId ||
                    !warehouseId ||
                    !Number.isInteger(quantity) ||
                    quantity <= 0 ||
                    !["INCREASE", "DECREASE"].includes(direction)
                ) {
                    throw new Error(
                        `Invalid adjustment at index ${i}`
                    );
                }

                const key = `${productId}-${warehouseId}`;

                if (seen.has(key)) {
                    throw new Error(
                        `Duplicate adjustment for ${productId} at ${warehouseId}`
                    );
                }

                seen.add(key);

                const inventory = await Inventory.findOne({
                    productId,
                    warehouseId
                }).session(session);

                if (!inventory) {
                    throw new Error(
                        `Inventory not found for ${productId} at ${warehouseId}`
                    );
                }

                const delta =
                    direction === "INCREASE"
                        ? quantity
                        : -quantity;

                const newQuantity =
                    inventory.quantity + delta;

                if (newQuantity < 0) {
                    throw new Error(
                        `Insufficient inventory for ${productId} at ${warehouseId}`
                    );
                }

                operations.push({
                    updateOne: {
                        filter: {
                            _id: inventory._id
                        },
                        update: {
                            $inc: {
                                quantity: delta
                            }
                        }
                    }
                });

                transactionDocuments.push({
                    transactionId:
                        `${batchId}-${i + 1}`,
                    productId,
                    warehouseId,
                    type: "ADJUSTMENT",
                    quantity,
                    adjustmentDirection: direction,
                    referenceId: batchId,
                    transactionDate: new Date()
                });

                changes.push({
                    productId,
                    warehouseId,
                    previousQuantity: inventory.quantity,
                    adjustment: direction === "INCREASE"
                        ? `+${quantity}`
                        : `-${quantity}`,
                    newQuantity
                });
            }

            const bulkResult = await Inventory.bulkWrite(
                operations,
                {
                    ordered: true,
                    session
                }
            );

            await InventoryTransaction.insertMany(
                transactionDocuments,
                {
                    session,
                    ordered: true
                }
            );

            resultData = {
                batchId,
                adjustmentCount: adjustments.length,
                matchedCount: bulkResult.matchedCount,
                modifiedCount: bulkResult.modifiedCount,
                changes
            };
        });

        res.status(200).json({
            success: true,
            message:
                "Batch inventory adjustment completed successfully.",
            data: resultData
        });

    } catch (error) {

        console.error(
            "Batch inventory adjustment error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                "Batch inventory adjustment failed. All changes were rolled back.",
            error: error.message
        });

    } finally {
        await session.endSession();
    }
};

const getLowStockView = async (req, res) => {
    try {
        const results = await mongoose.connection.db
            .collection("low_stock_inventory")
            .find({})
            .toArray();

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const manageReorderThreshold = async (req, res) => {
    try {
        const { productId, warehouseId, operation, value } = req.body;

        if (
            !productId ||
            !warehouseId ||
            !Number.isFinite(value) ||
            value < 0 ||
            !["set", "increase"].includes(operation)
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide productId, warehouseId, a non-negative numeric value, and operation: set or increase"
            });
        }

        const update =
            operation === "set"
                ? { $set: { reorderLevel: value } }
                : { $inc: { reorderLevel: value } };

        const inventory = await Inventory.findOneAndUpdate(
            { productId, warehouseId },
            update,
            { new: true, runValidators: true }
        );

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Reorder threshold updated successfully",
            data: {
                productId: inventory.productId,
                warehouseId: inventory.warehouseId,
                quantity: inventory.quantity,
                reorderLevel: inventory.reorderLevel
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deductStockSafely = async (req, res) => {
    try {
        const { productId, warehouseId, quantity } = req.body;

        // Validate the request
        if (
            typeof productId !== "string" ||
            !productId.trim() ||
            typeof warehouseId !== "string" ||
            !warehouseId.trim() ||
            typeof quantity !== "number" ||
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Provide productId, warehouseId, and a positive numeric quantity."
            });
        }

        // Atomically check stock and deduct the requested quantity
        const inventory = await Inventory.findOneAndUpdate(
            {
                productId: productId.trim(),
                warehouseId: warehouseId.trim(),
                quantity: { $gte: quantity }
            },
            {
                $inc: { quantity: -quantity }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!inventory) {
            return res.status(409).json({
                success: false,
                message:
                    "Stock deduction failed: inventory was not found or available stock is insufficient."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Stock deducted successfully.",
            data: {
                productId: inventory.productId,
                warehouseId: inventory.warehouseId,
                deductedQuantity: quantity,
                remainingStock: inventory.quantity
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to process stock deduction.",
            error: error.message
        });
    }
};

module.exports = {
    createInventory,
    getInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
    batchAdjustInventory,
    getLowStockView,
    manageReorderThreshold,
    deductStockSafely 
};

