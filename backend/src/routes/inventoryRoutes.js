const express = require("express");

const {
    createInventory,
    getInventory,
    getInventoryById,
    updateInventory,
    deleteInventory
} = require("../controllers/inventoryController");

const router = express.Router();

router.post("/", createInventory);
router.get("/", getInventory);
router.get("/:id", getInventoryById);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

module.exports = router;