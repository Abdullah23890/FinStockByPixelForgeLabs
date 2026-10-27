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

export const getNotExpireBatches = async (req, res) => {
    try {

        const today = new Date ();
        today.setHours(0, 0, 0, 0);
        const noExpire = await Batches.find({
            expiryDate : { $gt: today },
        }).populate("purchaseId", "purchaseNumber").populate("createdBy", "name role").populate("product", "name").sort({ expiryDate: -1 });

        return res.status(200).json({
            success : true,
            message : "Active Batches Fetched Successfully",
            data : noExpire
        });
            

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}