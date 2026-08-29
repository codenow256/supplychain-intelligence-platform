const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
    {
        shipmentId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        orderId: {
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

        shippedDate: {
            type: Date
        },

        expectedDeliveryDate: {
            type: Date,
            required: true
        },

        actualDeliveryDate: {
            type: Date
        },

        status: {
            type: String,
            enum: ["pending", "in_transit", "delivered", "delayed"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Shipment", shipmentSchema);