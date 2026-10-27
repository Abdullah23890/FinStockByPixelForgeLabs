import express from "express";

import {
    createDeveloperContact,
    getDeveloperContact
} from "../controllers/developer.controller.js";

const router = express.Router();

router.post("/", createDeveloperContact);
router.get("/", getDeveloperContact);

export default router;