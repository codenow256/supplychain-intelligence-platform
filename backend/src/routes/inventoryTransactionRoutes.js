const express = require("express");

const {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
} = require("../controllers/inventoryTransactionController");

const router = express.Router();

router.post("/", createTransaction);
router.get("/", getTransactions);
router.get("/:transactionId", getTransactionById);
router.put("/:transactionId", updateTransaction);
router.delete("/:transactionId", deleteTransaction);

module.exports = router;