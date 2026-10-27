import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    createCustomerValidator,
    updateCustomerValidator
} from "../validators/customer.validator.js";

import {
    createCustomer,
    getCustomers,
    updateCustomer,
    getCustomerLedger
} from "../controllers/customer.controller.js";

const router = express.Router();

router.post("/", verifyToken, authRole("admin", "saleManager", "counter"), createCustomerValidator, createCustomer);
router.get("/", verifyToken, authRole("admin", "saleManager", "counter"), getCustomers);
router.get("/:id/ledger", verifyToken, authRole("admin", "saleManager"), getCustomerLedger);
router.put("/:id", verifyToken, authRole("admin"), updateCustomerValidator, updateCustomer);

export default router;