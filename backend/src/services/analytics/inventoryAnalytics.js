const InventoryTransaction = require("../../models/InventoryTransaction");
const Inventory = require("../../models/Inventory");


// ======================================================
// INVENTORY MOVEMENT ANALYTICS
// ======================================================

const getInventoryMovementAnalytics = async (filters) => {

    const {
        productId,
        warehouseId,
        type,
        from,
        to,
        sortBy = "netMovement",
        order = "asc",
        limit = 10
    } = filters;


    // ------------------------------------------
    // Build filtering conditions
    // ------------------------------------------

    const match = {};

    if (productId) {
        match.productId = productId;
    }

    if (warehouseId) {
        match.warehouseId = warehouseId;
    }

    if (type) {
        match.type = type;
    }


    // Date range
    if (from || to) {

        match.transactionDate = {};

        if (from) {
            match.transactionDate.$gte = new Date(from);
        }

        if (to) {
            match.transactionDate.$lte = new Date(to);
        }
    }


    // ------------------------------------------
    // Aggregation pipeline
    // ------------------------------------------

    const pipeline = [];


    // Filter first
    if (Object.keys(match).length > 0) {

        pipeline.push({
            $match: match
        });
    }


    // Group by product + warehouse
    pipeline.push({

        $group: {

            _id: {
                productId: "$productId",
                warehouseId: "$warehouseId"
            },


            totalIn: {

                $sum: {

                    $cond: [
                        { $eq: ["$type", "IN"] },
                        "$quantity",
                        0
                    ]

                }

            },


            totalOut: {

                $sum: {

                    $cond: [
                        { $eq: ["$type", "OUT"] },
                        "$quantity",
                        0
                    ]

                }

            },


            transactionCount: {
                $sum: 1
            }

        }

    });


    // Calculate net movement
    pipeline.push({

        $addFields: {

            netMovement: {

                $subtract: [
                    "$totalIn",
                    "$totalOut"
                ]

            }

        }

    });


    // ------------------------------------------
    // Sorting
    // ------------------------------------------

    const allowedSortFields = [
        "totalIn",
        "totalOut",
        "netMovement",
        "transactionCount"
    ];

    const safeSortBy =
        allowedSortFields.includes(sortBy)
            ? sortBy
            : "netMovement";


    const sortOrder =
        order === "desc"
            ? -1
            : 1;


    pipeline.push({

        $sort: {
            [safeSortBy]: sortOrder
        }

    });


    // ------------------------------------------
    // Limit
    // ------------------------------------------

    const safeLimit = Math.min(
        Math.max(parseInt(limit) || 10, 1),
        100
    );


    pipeline.push({

        $limit: safeLimit

    });


    // ------------------------------------------
    // Final response shape
    // ------------------------------------------

    pipeline.push({

        $project: {

            _id: 0,

            productId: "$_id.productId",

            warehouseId: "$_id.warehouseId",

            totalIn: 1,

            totalOut: 1,

            netMovement: 1,

            transactionCount: 1

        }

    });


    return await InventoryTransaction.aggregate(
        pipeline
    );
};


// ======================================================
// INVENTORY RISK ANALYTICS
// ======================================================

const getInventoryRiskAnalytics = async (filters) => {

    const {
        warehouseId,
        productId,
        limit = 20
    } = filters;


    // ------------------------------------------
    // Build inventory filter
    // ------------------------------------------

    const match = {};

    if (warehouseId) {
        match.warehouseId = warehouseId;
    }

    if (productId) {
        match.productId = productId;
    }


    // ------------------------------------------
    // Inventory risk pipeline
    // ------------------------------------------

    const pipeline = [];


    if (Object.keys(match).length > 0) {

        pipeline.push({
            $match: match
        });

    }


    // ------------------------------------------
    // Calculate risk indicators
    // ------------------------------------------

    pipeline.push({

        $addFields: {

            stockGap: {
                $subtract: [
                    "$quantity",
                    "$reorderLevel"
                ]
            },


            stockRatio: {

                $cond: [

                    {
                        $eq: [
                            "$reorderLevel",
                            0
                        ]
                    },

                    null,

                    {
                        $divide: [
                            "$quantity",
                            "$reorderLevel"
                        ]
                    }

                ]

            }

        }

    });


    // ------------------------------------------
    // Categorize inventory risk
    // ------------------------------------------

    pipeline.push({

        $addFields: {

            riskLevel: {

                $cond: [

                    {
                        $lte: [
                            "$quantity",
                            "$reorderLevel"
                        ]
                    },

                    "HIGH",

                    {

                        $cond: [

                            {
                                $lte: [
                                    "$stockRatio",
                                    1.5
                                ]
                            },

                            "MEDIUM",

                            "LOW"

                        ]

                    }

                ]

            }

        }

    });


    // ------------------------------------------
    // Highest risk first
    // ------------------------------------------

    pipeline.push({

        $sort: {

            stockRatio: 1

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

            productId: 1,

            warehouseId: 1,

            quantity: 1,

            reorderLevel: 1,

            stockGap: 1,

            stockRatio: 1,

            riskLevel: 1

        }

    });


    return await Inventory.aggregate(
        pipeline
    );
};


module.exports = {
    getInventoryMovementAnalytics,
    getInventoryRiskAnalytics
};