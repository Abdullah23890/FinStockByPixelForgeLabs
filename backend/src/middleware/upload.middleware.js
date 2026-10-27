import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "PFL-Cosmetic/logo",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
            {
                width: 500,
                height: 500,
                crop: "limit",
            },
        ],
    },
});

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpg",
            "image/jpeg",
            "image/png",
            "image/webp",
        ];
        if(allowedTypes.includes(file.mimetype)){
            cb(null, true)
        } else {
            cb(new Error("Only JPG, JPEG, PNG & WEBP images are allowed"));
        }
    },
});