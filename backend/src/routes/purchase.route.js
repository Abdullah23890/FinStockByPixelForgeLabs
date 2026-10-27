import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    createPurchaseValidator
} from "../validators/purchase.validator.js";

import {
    createPurchase,
    getPurchase,
    getPurchaseById,
    updatePurchase,
    addPayment
} from "../controllers/purchase.controller.js";

const router = express.Router();

router.post("/", verifyToken, authRole("admin", "saleManager"), createPurchaseValidator, createPurchase);
router.post("/:purchaseId/payment", verifyToken, authRole("admin", "saleManager"), addPayment);
router.get("/", verifyToken, authRole("admin", "saleManager"), getPurchase);
router.get("/:id", verifyToken, authRole("admin", "saleManager"), getPurchaseById);
router.put("/:id", verifyToken, authRole("admin", "saleManager"), updatePurchase);

export default router;