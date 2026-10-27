import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    createSupplierValidator,
    updateSupplierValidator
} from "../validators/supplier.validator.js";

import {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    getSupplierLedger
} from "../controllers/supplier.controller.js";

const router = express.Router();

router.post("/", verifyToken, authRole("admin", "saleManager"), createSupplierValidator, createSupplier);
router.get("/", verifyToken, authRole("admin", "saleManager"), getSuppliers);
router.get("/:id", verifyToken, authRole("admin", "saleManager"), getSupplierById);
router.get("/:id/ledger", verifyToken, authRole("admin", "saleManager"), getSupplierLedger);
router.put("/:id", verifyToken, authRole("admin", "saleManager"), updateSupplierValidator, updateSupplier);
router.delete("/:id", verifyToken, authRole("admin"), deleteSupplier);

export default router;