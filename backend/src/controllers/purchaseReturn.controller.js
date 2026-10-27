import mongoose from "mongoose";
import Purchases from "../models/Purchases.js";
import Batches from "../models/Batches.js";
import PurchaseReturns from "../models/PurchaseReturn.js";
import SupplierCreditNotes from "../models/SupplierCreditNote.js";

export const createPurchaseReturn = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { purchaseId, items, reason, refundMethod } = req.body;

        if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Invalid Purchase ID." });
        }
        if (!Array.isArray(items) || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "At least one item is required for return." });
        }
        if (!refundMethod) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Refund method is required." });
        }

        const purchase = await Purchases.findById(purchaseId).session(session);
        if (!purchase) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Purchase not found." });
        }

        const purchaseItemsIndexByBatch = new Map();
        purchase.items.forEach((item, idx) => {
            purchaseItemsIndexByBatch.set(String(item.batchId), idx);
        });

        let returnSubTotal = 0;
        const returnItems = [];
        const itemUpdates = [];

        for (const ret of items) {
            if (!mongoose.Types.ObjectId.isValid(ret.batch)) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Invalid Batch ID." });
            }

            const idx = purchaseItemsIndexByBatch.get(String(ret.batch));
            if (idx === undefined) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Return item does not match the original purchase." });
            }

            const originalItem = purchase.items[idx];
            const returnQuantity = Number(ret.quantity);

            if (!Number.isFinite(returnQuantity) || returnQuantity <= 0) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Return quantity must be greater than 0." });
            }

            const alreadyReturned = Number(originalItem.returnQuantity || 0);
            const remainingQuantity = Number(originalItem.quantity) - alreadyReturned;

            if (returnQuantity > remainingQuantity) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `Only ${remainingQuantity} quantity can be returned for this item.`,
                });
            }

            const batch = await Batches.findById(ret.batch).session(session);
            if (!batch) {
                await session.abortTransaction();
                return res.status(404).json({ success: false, message: "Batch not found." });
            }
            if (batch.quantity < returnQuantity) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `Cannot return ${returnQuantity} of batch "${batch.batchNo}" — only ${batch.quantity} left in stock.`,
                });
            }

            const unitPrice = Number(originalItem.purchasePrice || 0);
            const lineTotal = unitPrice * returnQuantity;

            returnSubTotal += lineTotal;

            returnItems.push({
                product: originalItem.product,
                batch: ret.batch,
                quantity: returnQuantity,
                unitPrice,
                discount: 0,
                total: lineTotal,
            });

            itemUpdates.push({ idx, quantity: returnQuantity, amount: lineTotal });

            batch.quantity -= returnQuantity;
            await batch.save({ session });
        }

        const returnTotalAmount = returnSubTotal;
        const previousReturnTotal = Number(purchase.totalReturnAmount || 0);
        const previousCashRefund = Number(purchase.cashRefundAmount || 0);
        const previousCreditRefund = Number(purchase.creditNoteAmount || 0);

        const lastReturn = await PurchaseReturns.findOne().sort({ createdAt: -1 }).session(session);
        let returnNo = "PRET-0001";
        if (lastReturn && lastReturn.returnNo) {
            const lastNumber = parseInt(lastReturn.returnNo.split("-")[1]);
            if (!isNaN(lastNumber)) returnNo = `PRET-${String(lastNumber + 1).padStart(4, "0")}`;
        }

        const [newReturn] = await PurchaseReturns.create(
            [{
                returnNo,
                purchase: purchase._id,
                supplier: purchase.supplier,
                items: returnItems,
                subTotal: returnSubTotal,
                discount: 0,
                tax: 0,
                totalAmount: returnTotalAmount,
                reason,
                refundMethod,
                createdBy: req.user?.id,
            }],
            { session }
        );

        for (const upd of itemUpdates) {
            const item = purchase.items[upd.idx];
            item.returnQuantity = Number(item.returnQuantity || 0) + upd.quantity;
            item.returnAmount = Number(item.returnAmount || 0) + upd.amount;
        }

        purchase.totalReturnAmount = previousReturnTotal + returnTotalAmount;
        purchase.netAmount = Math.max(Number(purchase.totalAmount || 0) - purchase.totalReturnAmount, 0);

        const refundOwedTotal = Math.max(Number(purchase.paidAmount || 0) - purchase.netAmount, 0);
        const alreadyRefunded = previousCashRefund + previousCreditRefund;
        const refundThisTime = Math.max(refundOwedTotal - alreadyRefunded, 0);

        let creditNoteDoc = null;

        if (refundThisTime > 0) {
            if (refundMethod === "creditNote") {
                purchase.creditNoteAmount = previousCreditRefund + refundThisTime;

                const lastCN = await SupplierCreditNotes.findOne().sort({ createdAt: -1 }).session(session);
                let creditNoteNumber = "SCN-0001";
                if (lastCN && lastCN.creditNoteNumber) {
                    const lastNum = parseInt(lastCN.creditNoteNumber.split("-")[1]);
                    if (!isNaN(lastNum)) creditNoteNumber = `SCN-${String(lastNum + 1).padStart(4, "0")}`;
                }

                const [cn] = await SupplierCreditNotes.create(
                    [{
                        creditNoteNumber,
                        supplier: purchase.supplier,
                        purchase: purchase._id,
                        purchaseReturn: newReturn._id,
                        amount: refundThisTime,
                        usedAmount: 0,
                        remainingAmount: refundThisTime,
                        status: "active",
                        createdBy: req.user?.id,
                    }],
                    { session }
                );
                creditNoteDoc = cn;
            } else {
                purchase.cashRefundAmount = previousCashRefund + refundThisTime;
            }
        }

        const effectivePaid = Math.max(
            0,
            Number(purchase.paidAmount || 0) - Number(purchase.cashRefundAmount || 0) - Number(purchase.creditNoteAmount || 0)
        );

        purchase.remainingAmount = Math.max(purchase.netAmount - effectivePaid, 0);

        if (purchase.netAmount <= 0 || purchase.remainingAmount <= 0) {
            purchase.status = "paid";
        } else if (effectivePaid > 0) {
            purchase.status = "partial";
        } else {
            purchase.status = "unPaid";
        }

        await purchase.save({ session });

        await session.commitTransaction();

        const populated = await PurchaseReturns.findById(newReturn._id)
            .populate("items.product", "name barcode")
            .populate("items.batch", "batchNo")
            .populate("supplier", "name")
            .populate("createdBy", "name role");

        return res.status(201).json({
            success: true,
            message: "Purchase return processed successfully.",
            data: {
                return: populated,
                creditNote: creditNoteDoc,
                refundedAmount: refundThisTime,
                netAmount: purchase.netAmount,
                remainingAmount: purchase.remainingAmount,
                cashRefundAmount: purchase.cashRefundAmount,
                creditNoteAmount: purchase.creditNoteAmount,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    } finally {
        session.endSession();
    }
};

export const getPurchaseReturns = async (req, res) => {
    try {
        const returns = await PurchaseReturns.find()
            .populate("items.product", "name barcode")
            .populate("items.batch", "batchNo")
            .populate("supplier", "name contactNo")
            .populate("purchase", "purchaseNumber totalAmount paidAmount")
            .populate("createdBy", "name role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Purchase returns fetched successfully.",
            data: returns,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

export const getPurchaseReturnsByPurchase = async (req, res) => {
    try {
        const { purchaseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
            return res.status(400).json({ success: false, message: "Invalid Purchase ID." });
        }

        const returns = await PurchaseReturns.find({ purchase: purchaseId })
            .populate("items.product", "name barcode")
            .populate("items.batch", "batchNo")
            .populate("supplier", "name contactNo")
            .populate("createdBy", "name role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Returns for this purchase fetched successfully.",
            data: returns,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};
