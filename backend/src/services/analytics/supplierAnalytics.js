const Order = require("../../models/Order");


// ======================================================
// SUPPLIER PERFORMANCE ANALYTICS
// ======================================================

const getSupplierPerformanceAnalytics = async (filters) => {

    const {
        supplierId,
        status,
        from,
        to,
        sortBy = "orderCount",
        order = "desc",
        limit = 20
    } = filters;


    const match = {};


    if (supplierId) {
        match.supplierId = supplierId;
    }

    if (status) {
        match.status = status;
    }


    if (from || to) {

        match.orderDate = {};

        if (from) {
            match.orderDate.$gte = new Date(from);
        }

        if (to) {
            match.orderDate.$lte = new Date(to);
        }

    }


    const pipeline = [];


    // ------------------------------------------
    // Filter orders
    // ------------------------------------------

    if (Object.keys(match).length > 0) {

        pipeline.push({
            $match: match
        });

    }


    // ------------------------------------------
    // Group by supplier
    // ------------------------------------------

    pipeline.push({

        $group: {

            _id: "$supplierId",

            orderCount: {
                $sum: 1
            },


            totalOrderedQuantity: {

                $sum: {

                    $reduce: {

                        input: "$items",

                        initialValue: 0,

                        in: {

                            $add: [

                                "$$value",

                                "$$this.quantity"

                            ]

                        }

                    }

                }

            },


            completedOrders: {

                $sum: {

                    $cond: [

                        {
                            $eq: [
                                "$status",
                                "completed"
                            ]
                        },

                        1,

                        0

                    ]

                }

            },


            cancelledOrders: {

                $sum: {

                    $cond: [

                        {
                            $eq: [
                                "$status",
                                "cancelled"
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
    // Calculate completion rate
    // ------------------------------------------

    pipeline.push({

        $addFields: {

            completionRate: {

                $cond: [

                    {
                        $eq: [
                            "$orderCount",
                            0
                        ]
                    },

                    0,

                    {

                        $multiply: [

                            {

                                $divide: [

                                    "$completedOrders",

                                    "$orderCount"

                                ]

                            },

                            100

                        ]

                    }

                ]

            }

        }

    });


    // ------------------------------------------
    // Sorting
    // ------------------------------------------

    const allowedSortFields = [
        "orderCount",
        "totalOrderedQuantity",
        "completedOrders",
        "cancelledOrders",
        "completionRate"
    ];


    const safeSortBy =
        allowedSortFields.includes(sortBy)
            ? sortBy
            : "orderCount";


    pipeline.push({

        $sort: {

            [safeSortBy]:
                order === "asc"
                    ? 1
                    : -1

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

            supplierId: "$_id",

            orderCount: 1,

            totalOrderedQuantity: 1,

            completedOrders: 1,

            cancelledOrders: 1,

            completionRate: 1

        }

    });


    return await Order.aggregate(
        pipeline
    );
};


module.exports = {
    getSupplierPerformanceAnalytics
};