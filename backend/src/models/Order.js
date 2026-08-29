const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        productId: {
            type: String,
            required: true
        },

        supplierId: {
            type: String,
            required: true
        },

        warehouseId: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        orderDate: {
            type: Date,
            default: Date.now
        },

        expectedDeliveryDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);