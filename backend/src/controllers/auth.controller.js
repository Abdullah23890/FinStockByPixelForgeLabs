import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/Users.js";

export const auth = async (req, res) => {
    try {

        const {
            userName,
            password
        } = req.body;

        const existUser = await User.findOne({ 
            userName,
            status: "active"
        });

        if(!existUser){
            return res.status(401).json({
                success : false,
                message : "Invalid username & password."
            })
        }

        const isPasswordMatch = await bcrypt.compare( 
            password,
            existUser.password
        )

        if(!isPasswordMatch){
            return res.status(401).json({
                success : false,
                message : "Invalid username & password."
            })
        }

        const token = jwt.sign(
            {
                id: existUser._id,
                role: existUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn : process.env.JWT_EXPIRES_IN
            }
        )

        const userResponse = existUser.toObject();
        delete userResponse.password;

        return res.status(200).json({
            success : true,
            message : "Login Successfull.",
            token,
            user : userResponse
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}