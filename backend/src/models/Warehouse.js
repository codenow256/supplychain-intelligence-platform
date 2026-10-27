const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
    {
        warehouseId: {
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

        geoLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number],
                validate: {
                    validator: function (coordinates) {
                        return (
                            coordinates.length === 2 &&
                            coordinates[0] >= -180 &&
                            coordinates[0] <= 180 &&
                            coordinates[1] >= -90 &&
                            coordinates[1] <= 90
                        );
                    },
                    message: "Coordinates must be [longitude, latitude]."
                }
            }
        },

        capacity: {
            type: Number,
            required: true,
            min: 0
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

warehouseSchema.index({ geoLocation: "2dsphere" });
module.exports = mongoose.model("Warehouse", warehouseSchema);