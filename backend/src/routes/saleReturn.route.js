import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    createSaleReturn,
    getSaleReturns,
    getSaleReturnsBySale
} from "../controllers/saleReturn.controller.js";

const router = express.Router();

router.post("/", verifyToken, authRole("admin", "saleManager", "counter"), createSaleReturn);
router.get("/", verifyToken, authRole("admin", "saleManager", "counter"), getSaleReturns);
router.get("/sale/:saleId", verifyToken, authRole("admin", "saleManager", "counter"), getSaleReturnsBySale);

export default router;