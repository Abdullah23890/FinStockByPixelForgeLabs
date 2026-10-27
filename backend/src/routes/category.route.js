import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    createCategoryValidator,
    updateCategoryValidator
} from "../validators/category.validator.js";

import {
    createCategory,
    getCategories,
    getCategoriesById,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js";

const router = express.Router();

router.post("/", verifyToken, authRole("admin", "saleManager"), createCategoryValidator, createCategory);
router.get("/", verifyToken, authRole("admin", "saleManager", "counter"), getCategories);
router.get("/:id", verifyToken, authRole("admin", "saleManager", "counter"), getCategoriesById);
router.put("/:id", verifyToken, authRole("admin", "saleManager"), updateCategoryValidator, updateCategory);
router.delete("/:id", verifyToken, authRole("admin", "saleManager"), deleteCategory);

export default router;