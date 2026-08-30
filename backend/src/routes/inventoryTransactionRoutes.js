const express = require("express");

const {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionsByProductWarehouse
} = require("../controllers/inventoryTransactionController");

const router = express.Router();

router.post("/", createTransaction);
router.get("/", getTransactions);
router.get("/product/:productId/warehouse/:warehouseId", getTransactionsByProductWarehouse);
router.get("/:transactionId", getTransactionById);
router.put("/:transactionId", updateTransaction);
router.delete("/:transactionId", deleteTransaction);

module.exports = router;