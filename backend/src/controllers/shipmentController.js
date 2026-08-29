const Shipment = require("../models/Shipment");

// CREATE
const createShipment = async (req, res) => {
    try {
        const shipment = await Shipment.create(req.body);

        res.status(201).json(shipment);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// READ ALL
const getShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find();

        res.status(200).json(shipments);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// READ ONE
const getShipmentById = async (req, res) => {
    try {
        const shipment = await Shipment.findOne({
            shipmentId: req.params.shipmentId
        });

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        res.status(200).json(shipment);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// UPDATE
const updateShipment = async (req, res) => {
    try {
        const shipment = await Shipment.findOneAndUpdate(
            { shipmentId: req.params.shipmentId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        res.status(200).json(shipment);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// DELETE
const deleteShipment = async (req, res) => {
    try {
        const shipment = await Shipment.findOneAndDelete({
            shipmentId: req.params.shipmentId
        });

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        res.status(200).json({
            message: "Shipment deleted successfully",
            shipment
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipment,
    deleteShipment
};