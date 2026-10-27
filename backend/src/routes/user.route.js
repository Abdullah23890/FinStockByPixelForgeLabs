import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    createUserValidator,
    updateUserValidator
} from "../validators/user.validator.js";

import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", verifyToken, authRole("admin", "saleManager"), createUserValidator, createUser);
router.get("/", verifyToken, authRole("admin", "saleManager"), getAllUsers);
router.get("/:id", verifyToken, authRole("admin", "saleManager"), getUserById);
router.put("/:id", verifyToken, authRole("admin"), updateUserValidator, updateUser);
router.delete("/:id", verifyToken, authRole("admin"), deleteUser);

export default router;