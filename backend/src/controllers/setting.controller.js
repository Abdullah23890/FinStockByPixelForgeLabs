import Setting from "../models/Setting.js";
import mongoose from "mongoose";

export const createSetting = async (req, res) => {
    try {

        const existSetting = await Setting.findOne();
        if(existSetting){
            return res.status(400).json({
                success : false,
                message : "Setting Already Exists."
            })
        }

        const logo = req.files ? req.file.path : "";

        const {
            name,
            address,
            phone,
            printfooterText
        } = req.body;

        const newSetting = await Setting.create(
            {
                name,
                logo,
                address,
                phone,
                printfooterText
            }
        );

        const settingResponse = newSetting.toObject();
        return res.status(201).json({
            success : true,
            message : "Setting Created Successfully.",
            data: settingResponse
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message : "Internal Server Error."
        })
    }
}

export const getSetting = async (req, res) => {
    try {

        const setting = await Setting.findOne();
        if(!setting){
            return res.status(404).json({
                success : false,
                message : "Setting Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Setting Fetched Successfully.",
            data : setting
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const updateSetting = async (req, res) => {
    try {

        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const updatedData = req.body;
        if (req.file) {
            updatedData.logo = req.file.path;
        }
        
        const updatedSetting = await Setting.findByIdAndUpdate(
            id,
            updatedData,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if(!updatedSetting){
            return res.status(404).json({
                success : false,
                message : "Setting Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Setting Update Successfully.",
            data : updatedSetting
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}