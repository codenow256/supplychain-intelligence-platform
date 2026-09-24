const express = require("express");

const {
    createInventory,
    getInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
    batchAdjustInventory,
    getLowStockView
} = require("../controllers/inventoryController");

const router = express.Router();

router.post("/", createInventory);
router.post("/bulk-adjust", batchAdjustInventory);
router.get("/", getInventory);
router.get("/low-stock-view", getLowStockView);
router.get("/:id", getInventoryById);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

module.exports = router;