import express from "express";

import {
    verifyToken
} from "../middleware/auth.middleware.js";

import {
    authRole
} from "../middleware/role.middleware.js";

import {
    createProductValidator,
    updateProductValidator
} from "../validators/product.validator.js";

import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", verifyToken, authRole("admin", "saleManager"), createProductValidator, createProduct);
router.get("/", verifyToken, authRole("admin", "saleManager", "counter"), getProducts);
router.get("/:id", verifyToken, authRole("admin", "saleManager", "counter"), getProductById);
router.put("/:id", verifyToken, authRole("admin", "saleManager"), updateProductValidator, updateProduct);
router.delete("/:id", verifyToken, authRole("admin", "saleManager"), deleteProduct);

export default router;