const Inventory = require("../../models/Inventory");


// ======================================================
// WAREHOUSE ANALYTICS
// ======================================================

const getWarehouseAnalytics = async (filters) => {

    const {
        warehouseId,
        limit = 20
    } = filters;


    const match = {};


    if (warehouseId) {
        match.warehouseId = warehouseId;
    }


    const pipeline = [];


    if (Object.keys(match).length > 0) {

        pipeline.push({
            $match: match
        });

    }


    // ------------------------------------------
    // Group inventory by warehouse
    // ------------------------------------------

    pipeline.push({

        $group: {

            _id: "$warehouseId",


            productCount: {
                $sum: 1
            },


            totalUnits: {
                $sum: "$quantity"
            },


            totalReorderUnits: {
                $sum: "$reorderLevel"
            },


            lowStockProducts: {

                $sum: {

                    $cond: [

                        {
                            $lte: [
                                "$quantity",
                                "$reorderLevel"
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
    // Calculate warehouse indicators
    // ------------------------------------------

    pipeline.push({

        $addFields: {

            stockGap: {

                $subtract: [

                    "$totalUnits",

                    "$totalReorderUnits"

                ]

            },


            lowStockPercentage: {

                $cond: [

                    {
                        $eq: [
                            "$productCount",
                            0
                        ]
                    },

                    0,

                    {

                        $multiply: [

                            {

                                $divide: [

                                    "$lowStockProducts",

                                    "$productCount"

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

            lowStockProducts: -1

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

            warehouseId: "$_id",

            productCount: 1,

            totalUnits: 1,

            totalReorderUnits: 1,

            stockGap: 1,

            lowStockProducts: 1,

            lowStockPercentage: 1

        }

    });


    return await Inventory.aggregate(
        pipeline
    );
};


module.exports = {
    getWarehouseAnalytics
};