const InventoryTransaction =
    require("../models/InventoryTransaction");

// CREATE
const createTransaction = async (req, res) => {
    try {
        const transaction =
            await InventoryTransaction.create(req.body);

        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// READ ALL
const getTransactions = async (req, res) => {
    try {
        const transactions =
            await InventoryTransaction.find();

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// READ ONE
const getTransactionById = async (req, res) => {
    try {
        const transaction =
            await InventoryTransaction.findOne({
                transactionId: req.params.transactionId
            });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// UPDATE
const updateTransaction = async (req, res) => {
    try {
        const transaction =
            await InventoryTransaction.findOneAndUpdate(
                { transactionId: req.params.transactionId },
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.status(200).json(transaction);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// DELETE
const deleteTransaction = async (req, res) => {
    try {
        const transaction =
            await InventoryTransaction.findOneAndDelete({
                transactionId: req.params.transactionId
            });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            message: "Transaction deleted successfully",
            transaction
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};