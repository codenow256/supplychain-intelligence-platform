const Warehouse = require("../models/Warehouse");

const createWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.create(req.body);
        res.status(201).json(warehouse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find();
        res.status(200).json(warehouses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOne({
            warehouseId: req.params.warehouseId
        });

        if (!warehouse) {
            return res.status(404).json({
                message: "Warehouse not found"
            });
        }

        res.status(200).json(warehouse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOneAndUpdate(
            { warehouseId: req.params.warehouseId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!warehouse) {
            return res.status(404).json({
                message: "Warehouse not found"
            });
        }

        res.status(200).json(warehouse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOneAndDelete({
            warehouseId: req.params.warehouseId
        });

        if (!warehouse) {
            return res.status(404).json({
                message: "Warehouse not found"
            });
        }

        res.status(200).json({
            message: "Warehouse deleted successfully",
            warehouse
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createWarehouse,
    getWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse
};