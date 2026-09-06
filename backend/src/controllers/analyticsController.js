const {
    getInventoryMovementAnalytics,
    getInventoryRiskAnalytics
} = require("../services/analytics/inventoryAnalytics");

const {
    getSupplierPerformanceAnalytics
} = require("../services/analytics/supplierAnalytics");

const {
    getShipmentPerformanceAnalytics
} = require("../services/analytics/shipmentAnalytics");

const {
    getWarehouseAnalytics: getWarehouseAnalyticsService
} = require("../services/analytics/warehouseAnalytics");


// ======================================================
// INVENTORY MOVEMENT
// ======================================================

const getInventoryMovement = async (req, res) => {
    try {
        const result = await getInventoryMovementAnalytics(req.query);

        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });

    } catch (error) {
        console.error("Inventory movement analytics error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to calculate inventory movement analytics",
            error: error.message
        });
    }
};


// ======================================================
// INVENTORY RISK
// ======================================================

const getInventoryRisk = async (req, res) => {
    try {
        const result = await getInventoryRiskAnalytics(req.query);

        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });

    } catch (error) {
        console.error("Inventory risk analytics error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to calculate inventory risk analytics",
            error: error.message
        });
    }
};


// ======================================================
// SUPPLIER PERFORMANCE
// ======================================================

const getSupplierPerformance = async (req, res) => {
    try {
        const result = await getSupplierPerformanceAnalytics(req.query);

        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });

    } catch (error) {
        console.error("Supplier performance analytics error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to calculate supplier performance analytics",
            error: error.message
        });
    }
};


// ======================================================
// SHIPMENT PERFORMANCE
// ======================================================

const getShipmentPerformance = async (req, res) => {
    try {
        const result = await getShipmentPerformanceAnalytics(req.query);

        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });

    } catch (error) {
        console.error("Shipment performance analytics error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to calculate shipment performance analytics",
            error: error.message
        });
    }
};


// ======================================================
// WAREHOUSE ANALYTICS
// ======================================================

const getWarehouseAnalytics = async (req, res) => {
    try {
        const result = await getWarehouseAnalyticsService(req.query);

        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });

    } catch (error) {
        console.error("Warehouse analytics error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to calculate warehouse analytics",
            error: error.message
        });
    }
};


module.exports = {
    getInventoryMovement,
    getInventoryRisk,
    getSupplierPerformance,
    getShipmentPerformance,
    getWarehouseAnalytics
};