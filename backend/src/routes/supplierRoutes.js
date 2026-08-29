const express = require("express");

const {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
} = require("../controllers/supplierController");

const router = express.Router();

router.post("/", createSupplier);
router.get("/", getSuppliers);
router.get("/:supplierId", getSupplierById);
router.put("/:supplierId", updateSupplier);
router.delete("/:supplierId", deleteSupplier);

module.exports = router;