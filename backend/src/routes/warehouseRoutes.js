const express = require("express");

const {
    createWarehouse,
    getWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse
} = require("../controllers/warehouseController");

const router = express.Router();

router.post("/", createWarehouse);
router.get("/", getWarehouses);
router.get("/:warehouseId", getWarehouseById);
router.put("/:warehouseId", updateWarehouse);
router.delete("/:warehouseId", deleteWarehouse);

module.exports = router;