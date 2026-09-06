const Shipment = require("../../models/Shipment");


// ======================================================
// SHIPMENT PERFORMANCE ANALYTICS
// ======================================================

const getShipmentPerformanceAnalytics = async (filters) => {

    const {
        supplierId,
        warehouseId,
        status,
        from,
        to,
        limit = 20
    } = filters;


    const match = {};


    if (supplierId) {
        match.supplierId = supplierId;
    }

    if (warehouseId) {
        match.warehouseId = warehouseId;
    }

    if (status) {
        match.status = status;
    }


    if (from || to) {

        match.expectedDeliveryDate = {};

        if (from) {
            match.expectedDeliveryDate.$gte =
                new Date(from);
        }

        if (to) {
            match.expectedDeliveryDate.$lte =
                new Date(to);
        }

    }


    const pipeline = [];


    if (Object.keys(match).length > 0) {

        pipeline.push({
            $match: match
        });

    }


    // ------------------------------------------
    // Group by supplier + warehouse
    // ------------------------------------------

    pipeline.push({

        $group: {

            _id: {

                supplierId: "$supplierId",

                warehouseId: "$warehouseId"

            },


            shipmentCount: {
                $sum: 1
            },


            deliveredShipments: {

                $sum: {

                    $cond: [

                        {
                            $eq: [
                                "$status",
                                "delivered"
                            ]
                        },

                        1,

                        0

                    ]

                }

            },


            delayedShipments: {

                $sum: {

                    $cond: [

                        {
                            $eq: [
                                "$status",
                                "delayed"
                            ]
                        },

                        1,

                        0

                    ]

                }

            },


            inTransitShipments: {

                $sum: {

                    $cond: [

                        {
                            $eq: [
                                "$status",
                                "in_transit"
                            ]
                        },

                        1,

                        0

                    ]

                }

            }

        }

    });


    // ------------------------------------------
    // Calculate delay rate
    // ------------------------------------------

    pipeline.push({

        $addFields: {

            delayRate: {

                $cond: [

                    {
                        $eq: [
                            "$shipmentCount",
                            0
                        ]
                    },

                    0,

                    {

                        $multiply: [

                            {

                                $divide: [

                                    "$delayedShipments",

                                    "$shipmentCount"

                                ]

                            },

                            100

                        ]

                    }

                ]

            }

        }

    });


    pipeline.push({

        $sort: {

            delayedShipments: -1

        }

    });


    pipeline.push({

        $limit:
            Math.min(
                Math.max(parseInt(limit) || 20, 1),
                100
            )

    });


    pipeline.push({

        $project: {

            _id: 0,

            supplierId: "$_id.supplierId",

            warehouseId: "$_id.warehouseId",

            shipmentCount: 1,

            deliveredShipments: 1,

            delayedShipments: 1,

            inTransitShipments: 1,

            delayRate: 1

        }

    });


    return await Shipment.aggregate(
        pipeline
    );
};


module.exports = {
    getShipmentPerformanceAnalytics
};