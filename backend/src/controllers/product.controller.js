import mongoose from "mongoose";
import Products from "../models/Products.js";

export const createProduct = async (req, res) => {
    try {

        const {
            name,
            category,
            barcode,
            retailPrice,
            wholesalePrice,
            // parlorPrice,
            status
        } = req.body;

        const findBarcode = await Products.findOne({ barcode });
        if(findBarcode){
            return res.status(409).json({
                success : false,
                message : "Barcode Already Exists."
            })
        }

        const newProduct = await Products.create(
            {
                name,
                category,
                barcode,
                retailPrice,
                wholesalePrice,
                // parlorPrice,
                status,
                createdBy : req.user.id
            }
        );

        const productResponse = newProduct.toObject();
        
        return res.status(201).json({
            success : true,
            message : "Product Created Successfully.",
            data : productResponse
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getProducts = async (req, res) => {
    try {
        
        const allProduct = await Products.find().populate("category", "name").populate("createdBy", "name role").populate("updatedBy", "name role").sort({ createdAt: -1 });
        if(!allProduct){
            return res.status(400).json({
                success : fasle,
                message : "Product Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Products Fetched Successfully.",
            data : allProduct
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getProductById = async (req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const findProduct = await Products.findById(id).populate("category", "name").populate("createdBy", "name role").populate("updatedBy", "name role");
        if(!findProduct){
            return res.status(404).json({
                success : false,
                message : "Product Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Product Fetched Successfully.",
            data : findProduct
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const updateProduct = async (req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const updateData = req.body;
        updateData.updatedBy = req.user.id;
        const barcode = updateData.barcode;

        if(barcode){
            const findBarcode = await Products.findOne({ 
                barcode,
                _id: { $ne: id }
            });
            
            if(findBarcode){
            return res.status(409).json({
                success : false,
                message : "Barcode Already Exists."
            })
            }
        }

        const updatedProduct = await Products.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument : "after",
                runValidators : true
            }
        );

        if(!updatedProduct){
            return res.status(404).json({
                success : false,
                message : "Product Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Product Update Successfully.",
            data : updatedProduct
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const deletedProduct = await Products.findByIdAndDelete(id);

        if(!deletedProduct){
            return res.status(404).json({
                success : false,
                message : "Product Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Product Delete Successfully.",
            data : deletedProduct
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}