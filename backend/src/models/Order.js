const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        unitPrice: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: false
    }
);

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true
        },

        warehouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "Order must contain at least one item"
            }
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
            enum: [
                "pending",
                "confirmed",
                "completed",
                "cancelled"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);