import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    getBatches,
    getBatchesProduct
} from "../controllers/batch.controller.js";

const router = express.Router();

router.get("/", verifyToken, authRole("admin", "saleManager", "counter"), getBatches);
router.get("/getBatchesProduct", verifyToken, authRole("admin", "saleManager", "counter"), getBatchesProduct);

export default router;