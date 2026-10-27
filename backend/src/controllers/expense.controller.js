import mongoose, { mongo } from "mongoose";
import Expenses from "../models/Expenses.js";

export const createExpense = async(req, res) => {
    try{

        const {
            name,
            category,
            date,
            amount
        } = req.body;

        const newExpense = await Expenses.create(
            {
                name,
                category,
                date,
                amount,
                createdBy: req.user.id
            }
        );

        const expenseResponse = newExpense.toObject();
        return res.status(201).json({
            success : true,
            message : "Expense Created Successfully.",
            data : expenseResponse
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getExpense = async (req, res) => {
    try {
        
        const allExpense = await Expenses.find().populate("createdBy", "name role").populate("updatedBy", "name role").sort({ createdAt: -1 });
        if(!allExpense){
            return res.status(404).json({
                success : false,
                message : "Expense Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Expenses Fetched Successfully.",
            data : allExpense
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getExpenseById = async (req, res) => {
    try {
        
        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const findExpense = await Expenses.findById(id).populate("createdBy", "name role").populate("updatedBy", "name role");
        if(!findExpense){
            return res.status(404).json({
                success : false,
                message : "Expense Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Expense Fetched Successfully.",
            data : findExpense
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const updateExpense = async (req, res) => {
    try {

        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const updatedData = req.body;
        updatedData.updatedBy = req.user.id;
        const updatedExpense = await Expenses.findByIdAndUpdate(
            id,
            updatedData,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if(!updatedExpense){
            return res.status(404).json({
                success : false,
                message : "Expense Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Expenses Updated Successfully.",
            data : updatedExpense
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const deleteExpense = async(req, res) => {
    try {

        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const deletedExpense = await Expenses.findByIdAndDelete(id);
        if(!deletedExpense){
            return res.status(404).json({
                success : false,
                message : "Expense Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Expense Deleted Successfully.",
            data : deletedExpense
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}