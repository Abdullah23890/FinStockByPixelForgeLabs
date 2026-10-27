import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/Users.js";

export const createUser = async (req, res) => {
    try {

        const {
            name,
            userName,
            password,
            role,
            phone,
            status
        } = req.body;

        const existUserName = await User.findOne({userName});
        if(existUserName){
            return res.status(409).json({
                success : false,
                message : "This username already taken."
            })
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create(
            {
                name,
                userName,
                password : hashPassword,
                role,
                phone,
                status,
                createdBy : req.user.id
            }
        );

        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json({
            success : true,
            message : "User Created Successfully.",
            data : userResponse
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getAllUsers = async (req, res) => {
    try {

        const allUsers = await User.find().select("-password").sort({ createdAt: -1 }).populate("createdBy", "name role").populate("updatedBy", "name role");
        if(!allUsers){
            return res.status(404).json({
                success : false,
                message : "Users Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Users Fetched Successfully.",
            data : allUsers
        }) 

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getUserById = async (req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid User ID."
            })
        }

        const userFind = await User.findById(id).select("-password").populate("createdBy", "name role").populate("updatedBy", "name role");
        if(!userFind){
            return res.status(404).json({
                success : false,
                message : "User Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "User Fetched Successfully.",
            data : userFind
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const updateUser = async (req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Inalid User Id."
            })
        }

        const userData = req.body;
        userData.updatedBy = req.user.id

        if(userData.password){
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        if(userData.userName){
            const existUserName = await User.findOne({ userName: userData.userName });
            if(existUserName && existUserName._id.toString() !== id){
                return res.status(409).json({
                sucess : false,
                message : "This username already taken."
            })
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            userData,
            {
                returnDocument : "after",
                runValidators : true
            }
        ).select("-password").populate("createdBy", "name role").populate("updatedBy", "name role");
        if(!updatedUser){
            return res.status(404).json({
                success : false,
                message : "User Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "User Update Successfully.",
            data : updatedUser
        })
        

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const deleteUser = async (req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Inalid User Id."
            })
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if(!deletedUser){
            return res.status(404).json({
                success : false,
                message : "User Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "User Delete Successfully.",
            data : deletedUser
        })
        

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}