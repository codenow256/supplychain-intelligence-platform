const RestockAlert = require("../models/RestockAlert");

const createRestockAlert = async (req, res) => {
    try {
        const { productId, warehouseId, message, ttlMinutes } = req.body;

        if (
            typeof productId !== "string" ||
            !productId.trim() ||
            typeof warehouseId !== "string" ||
            !warehouseId.trim() ||
            typeof message !== "string" ||
            !message.trim() ||
            typeof ttlMinutes !== "number" ||
            !Number.isFinite(ttlMinutes) ||
            ttlMinutes <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Provide productId, warehouseId, message, and a positive ttlMinutes value."
            });
        }

        const expireAt = new Date(
            Date.now() + ttlMinutes * 60 * 1000
        );

        const alert = await RestockAlert.create({
            productId: productId.trim(),
            warehouseId: warehouseId.trim(),
            message: message.trim(),
            expireAt
        });

        return res.status(201).json({
            success: true,
            message: "Temporary restock alert created.",
            data: alert
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to create restock alert.",
            error: error.message
        });
    }
};

const getRestockAlerts = async (req, res) => {
    try {
        const alerts = await RestockAlert.find().sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve restock alerts.",
            error: error.message
        });
    }
};

module.exports = {
    createRestockAlert,
    getRestockAlerts
};