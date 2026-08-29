const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
    {
        supplierId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        leadTimeDays: {
            type: Number,
            required: true,
            min: 0
        },

        contactEmail: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Supplier", supplierSchema);