const Order = require("../models/Order");

// CREATE
const createOrder = async (req, res) => {
    try {
        const order = await Order.create(req.body);

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// READ ALL
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find();

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// READ ONE
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            orderId: req.params.orderId
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// UPDATE
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// DELETE
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({
            orderId: req.params.orderId
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order deleted successfully",
            order
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({
            orderId: req.params.orderId
        })
        .populate("supplierId")
        .populate("warehouseId")
        .populate("items.productId");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json(order);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getOrderDetails
};