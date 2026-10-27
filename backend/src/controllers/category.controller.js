import mongoose from "mongoose";
import Categories from "../models/Categories.js";

export const createCategory = async (req, res) => {
    try {

        const {
            name
        } = req.body;

        const newCategory = await Categories.create(
            {
            name,
            createdBy : req.user.id
            }
        );

        const categoryResponse = newCategory.toObject();

        return res.status(201).json({
            success : true,
            message : "Category created successfully.",
            data : categoryResponse
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getCategories = async (req, res) => {
    try {

        const allCategory = await Categories.find().populate("createdBy", "name role").populate("updatedBy", "name role").sort({ createdAt: -1});
        if(!allCategory){
            return res.status(404).json({
                success : false,
                message : "Categories not found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Categories fetched successfully.",
            data : allCategory
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getCategoriesById = async (req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const findCategory = await Categories.findById(id).populate("createdBy", "name role").populate("updatedBy", "name role");
        if(!findCategory){
            return res.status(404).json({
                success : false,
                message : "Category not found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Category Fetched Successfully.",
            data : findCategory
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const updateCategory = async (req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const categoryData = req.body;
        categoryData.updatedBy = req.user.id;
        const updatedCategory = await Categories.findByIdAndUpdate(
            id,
            categoryData,
            {
                returnDocument : "after",
                runValidators : true
            }
        );

        if(!updatedCategory){
            return res.status(404).json({
                success : false,
                message : "Category not found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Category Updated Successfully.",
            data : updatedCategory
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const deleteCategory = async (req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const deletedCategory = await Categories.findByIdAndDelete(id);

        if(!deletedCategory){
            return res.status(404).json({
                success : false,
                message : "Category not found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Category Deleted Successfully.",
            data : deletedCategory
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}