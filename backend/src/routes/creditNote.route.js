import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import { 
    getCreditNotes, 
    getCreditNotesByCustomer, 
    useCreditNote 
} from "../controllers/creditNote.controller.js";

const router = express.Router();

router.get("/", verifyToken, authRole("admin", "saleManager", "counter"), getCreditNotes);
router.get("/customer/:customerId", verifyToken, authRole("admin", "saleManager", "counter"), getCreditNotesByCustomer);
router.post("/use", verifyToken, authRole("admin", "saleManager", "counter"), useCreditNote);

export default router;