const Inventory = require("../models/Inventory");

const createInventory = async (req, res) => {
    try {
        const inventory = await Inventory.create(req.body);
        res.status(201).json(inventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find();
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInventoryById = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id);

        if (!inventory) {
            return res.status(404).json({
                message: "Inventory record not found"
            });
        }

        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateInventory = async (req, res) => {
    try {
        const inventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!inventory) {
            return res.status(404).json({
                message: "Inventory record not found"
            });
        }

        res.status(200).json(inventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteInventory = async (req, res) => {
    try {
        const inventory = await Inventory.findByIdAndDelete(
            req.params.id
        );

        if (!inventory) {
            return res.status(404).json({
                message: "Inventory record not found"
            });
        }

        res.status(200).json({
            message: "Inventory deleted successfully",
            inventory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createInventory,
    getInventory,
    getInventoryById,
    updateInventory,
    deleteInventory
};