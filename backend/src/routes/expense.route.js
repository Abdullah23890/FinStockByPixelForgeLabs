import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    createExpenseValidator,
    updateExpenseValidator
} from "../validators/expense.validator.js";

import {
    createExpense,
    getExpense,
    getExpenseById,
    updateExpense,
    deleteExpense
} from "../controllers/expense.controller.js";

const router = express.Router();

router.post("/", verifyToken, authRole("admin", "saleManager", "counter"), createExpenseValidator, createExpense);
router.get("/", verifyToken, authRole("admin", "saleManager", "counter"), getExpense);
router.get("/:id", verifyToken, authRole("admin", "saleManager", "counter"), getExpenseById);
router.put("/:id", verifyToken, authRole("admin", "saleManager", "counter"), updateExpenseValidator, updateExpense);
router.delete("/:id", verifyToken, authRole("admin", "saleManager"), deleteExpense);

export default router;