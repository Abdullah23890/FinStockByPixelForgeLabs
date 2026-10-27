import express from "express";

import {
    authValidators
} from "../validators/auth.validator.js";

import {
    auth
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/", authValidators, auth);

export default router;