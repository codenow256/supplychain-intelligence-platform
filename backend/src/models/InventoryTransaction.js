const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        productId: {
            type: String,
            required: true
        },

        warehouseId: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: ["IN", "OUT", "ADJUSTMENT"],
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        referenceId: {
            type: String
        },

        transactionDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "InventoryTransaction",
    inventoryTransactionSchema
);