import Products from "../models/Products.js";

export const getStockAlert = async (req, res) => {
    try {
        const stockReport = await Products.aggregate([
            {
                $lookup: {
                    from: "batches",
                    localField: "_id",
                    foreignField: "product",
                    as: "batches"
                }
            },

            {
                $addFields: {
                    totalStock: {
                        $sum: "$batches.quantity"
                    }
                }
            },

            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },

            {
                $unwind: {
                    path: "$categoryInfo",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Stock 7 ya us se kam
            {
                $match: {
                    $expr: {
                        $lte: ["$totalStock", 7]
                    }
                }
            },

            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    productName: "$name",
                    barcode: "$barcode",
                    categoryName: "$categoryInfo.name",

                    totalStock: 1,

                    status: {
                        $cond: [
                            { $eq: ["$totalStock", 0] },
                            "outOfStock",
                            "lowStock"
                        ]
                    }
                }
            },

            {
                $sort: {
                    totalStock: 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Stock Alerts Fetched Successfully.",
            data: stockReport
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};