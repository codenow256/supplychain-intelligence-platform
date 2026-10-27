const mongoose = require("mongoose");

const restockAlertSchema = new mongoose.Schema(
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
        message: {
            type: String,
            required: true
        },
        expireAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

// Automatically expire alerts after expireAt
restockAlertSchema.index(
    { expireAt: 1 },
    { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
    "RestockAlert",
    restockAlertSchema
);