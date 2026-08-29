const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
            trim: true
        },

        warehouseId: {
            type: String,
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 0
        },

        reorderLevel: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

inventorySchema.index(
    { productId: 1, warehouseId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);