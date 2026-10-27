import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    getDashboard
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/", verifyToken, authRole("admin", "saleManager"), getDashboard);

export default router;