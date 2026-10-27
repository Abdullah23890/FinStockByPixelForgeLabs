import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    getStockAlert
} from "../controllers/stockAlert.controller.js";

const router = express.Router();

router.get("/", verifyToken, authRole("admin", "saleManager"), getStockAlert);

export default router;