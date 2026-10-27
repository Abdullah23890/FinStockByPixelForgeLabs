import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    createSaleValidator,
    updateSaleValidator
} from "../validators/sale.validator.js";

import {
    createSale,
    getSales,
    getSaleById,
    addSalePayment,
    deleteSale
} from "../controllers/sale.controller.js";

const router = express.Router();

router.post("/", verifyToken, authRole("admin", "saleManager", "counter"), createSaleValidator, createSale);
router.post("/:saleId/payment", verifyToken, authRole("admin", "saleManager", "counter"), addSalePayment)
router.get("/", verifyToken, authRole("admin", "saleManager", "counter"), getSales);
router.get("/:id", verifyToken, authRole("admin", "saleManager", "counter"), getSaleById);
router.delete("/:id", verifyToken, authRole("admin", "saleManager", "counter"), deleteSale);

export default router;