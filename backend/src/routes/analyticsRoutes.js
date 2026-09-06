const express = require("express");

const {
    getInventoryMovement,
    getInventoryRisk,
    getSupplierPerformance,
    getShipmentPerformance,
    getWarehouseAnalytics
} = require("../controllers/analyticsController");

const router = express.Router();


// Inventory analytics
router.get(
    "/inventory/movement",
    getInventoryMovement
);

router.get(
    "/inventory/movement",
    (req, res, next) => {
        console.log(">>> INVENTORY MOVEMENT ROUTE HIT");
        next();
    },
    getInventoryMovement
);

router.get(
    "/inventory/risk",
    getInventoryRisk
);


// Supplier analytics
router.get(
    "/suppliers/performance",
    getSupplierPerformance
);


// Shipment analytics
router.get(
    "/shipments/performance",
    getShipmentPerformance
);


// Warehouse analytics
router.get(
    "/warehouses",
    getWarehouseAnalytics
);


module.exports = router;