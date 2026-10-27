const express = require("express");

const {
    createInventory,
    getInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
    batchAdjustInventory,
    getLowStockView,
    manageReorderThreshold,
    deductStockSafely 
} = require("../controllers/inventoryController");

const router = express.Router();

router.post("/", createInventory);
router.post("/bulk-adjust", batchAdjustInventory);
router.post("/deduct", deductStockSafely);
router.get("/", getInventory);
router.get("/low-stock-view", getLowStockView);
router.patch("/reorder-threshold", manageReorderThreshold);
router.get("/:id", getInventoryById);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

module.exports = router;