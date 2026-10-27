import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import { 
    createPurchaseReturn,
    getPurchaseReturns, 
    getPurchaseReturnsByPurchase
} from "../controllers/purchaseReturn.controller.js";

const router = express.Router();

router.post("/", verifyToken, authRole("admin", "saleManager"), createPurchaseReturn);
router.get("/", verifyToken, authRole("admin", "saleManager"), getPurchaseReturns);
router.get("/:purchaseId", verifyToken, authRole("admin", "saleManager"), getPurchaseReturnsByPurchase);

export default router;