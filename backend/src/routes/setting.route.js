import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    upload
} from "../middleware/upload.middleware.js";

import {
    createSetting,
    getSetting,
    updateSetting
} from "../controllers/setting.controller.js";

const router = express.Router();

router.post("/", verifyToken, authRole("admin"), upload.single("logo"), createSetting);
router.get("/", getSetting);
router.put("/:id", verifyToken, authRole("admin", "saleManager"), upload.single("logo"), updateSetting);

export default router;