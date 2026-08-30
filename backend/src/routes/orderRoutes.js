const express = require("express");

const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getOrderDetails
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:orderId", getOrderById);
router.put("/:orderId", updateOrder);
router.delete("/:orderId", deleteOrder);
router.get("/:orderId/details", getOrderDetails);

module.exports = router;