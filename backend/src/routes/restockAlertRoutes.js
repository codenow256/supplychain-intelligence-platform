const express = require("express");

const {
    createRestockAlert,
    getRestockAlerts
} = require("../controllers/restockAlertController");

const router = express.Router();

router.post("/", createRestockAlert);
router.get("/", getRestockAlerts);

module.exports = router;