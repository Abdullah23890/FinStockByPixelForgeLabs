import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    getBatches,
    getNotExpireBatches
} from "../controllers/batch.controller.js";

const router = express.Router();

router.get("/", verifyToken, authRole("admin", "saleManager", "counter"), getBatches);
router.get("/getNotExpireBatches", verifyToken, authRole("admin", "saleManager", "counter"), getNotExpireBatches);

export default router;