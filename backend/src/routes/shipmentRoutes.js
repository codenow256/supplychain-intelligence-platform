const express = require("express");

const {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipment,
    deleteShipment
} = require("../controllers/shipmentController");

const router = express.Router();

router.post("/", createShipment);
router.get("/", getShipments);
router.get("/:shipmentId", getShipmentById);
router.put("/:shipmentId", updateShipment);
router.delete("/:shipmentId", deleteShipment);

module.exports = router;