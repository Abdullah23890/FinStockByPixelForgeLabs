import Batches from "../models/Batches.js";

export const getBatches = async (req, res) => {
    try {
        
        const allBatches = await Batches.find().populate("purchaseId", "purchaseNumber").populate("createdBy", "name role").populate("product", "name").sort({ createdAt: -1 });

        if(!allBatches){
            return res.status(404).json({
                success : false,
                message : "Batches Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Batches Fetched Successfully.",
            data : allBatches
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getBatchesProduct = async (req, res) => {
    try {

        const batch = await Batches.find().populate("purchaseId", "purchaseNumber").populate("createdBy", "name role").populate("product", "name").sort({ expiryDate: -1 });

        return res.status(200).json({
            success : true,
            message : "Active Batches Fetched Successfully",
            data : batch
        });
            

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}