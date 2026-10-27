import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import { 
    generateReportPdf
} from "../controllers/report.controller.js";

const router = express.Router();

router.get("/:type", verifyToken, authRole("admin", "saleManager"), generateReportPdf);

export default router;