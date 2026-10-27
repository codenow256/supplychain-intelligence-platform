const Warehouse = require("../models/Warehouse");

const findNearestWarehouses = async (req, res) => {
    try {
        const longitude = Number(req.query.longitude);
        const latitude = Number(req.query.latitude);
        const maxDistance = Number(req.query.maxDistance || 50000);

        if (
            req.query.longitude === undefined ||
            req.query.latitude === undefined ||
            !Number.isFinite(longitude) ||
            !Number.isFinite(latitude) ||
            longitude < -180 ||
            longitude > 180 ||
            latitude < -90 ||
            latitude > 90 ||
            !Number.isFinite(maxDistance) ||
            maxDistance <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Provide valid longitude, latitude, and a positive maxDistance in metres."
            });
        }

        const warehouses = await Warehouse.find({
            geoLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: maxDistance
                }
            }
        }).limit(10);

        return res.status(200).json({
            success: true,
            count: warehouses.length,
            maxDistanceMeters: maxDistance,
            data: warehouses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to find nearby warehouses.",
            error: error.message
        });
    }
};

module.exports = { findNearestWarehouses };