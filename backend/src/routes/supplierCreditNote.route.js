import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import { 
    getSupplierCreditNotes, 
    getSupplierCreditNotesBySupplier 
} from "../controllers/supplierCreditNote.controller.js";

const router = express.Router();

router.get("/", verifyToken, authRole("admin", "saleManager"), getSupplierCreditNotes);
router.get("/:supplierId", verifyToken, authRole("admin", "saleManager"), getSupplierCreditNotesBySupplier);

export default router;
