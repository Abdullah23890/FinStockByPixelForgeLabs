import mongoose from "mongoose";
import Sales from "../models/Sales.js";
import Batches from "../models/Batches.js";
import Customers from "../models/Customers.js";
import SaleReturns from "../models/SaleReturn.js";
import CreditNotes from "../models/CreditNote.js";

export const createSaleReturn = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { saleId, items, reason, refundMethod } = req.body;

        if (!mongoose.Types.ObjectId.isValid(saleId)) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Invalid Sale ID." });
        }
        if (!Array.isArray(items) || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "At least one item is required for return." });
        }
        if (!refundMethod) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Refund method is required." });
        }

        const sale = await Sales.findById(saleId).session(session);
        if (!sale) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Sale not found." });
        }

        const saleItemsIndexByKey = new Map();
        sale.items.forEach((item, idx) => {
            const key = `${String(item.product)}-${String(item.batch)}`;
            saleItemsIndexByKey.set(key, idx);
        });

        let returnSubTotal = 0;
        const returnItems = [];
        const itemUpdates = [];

        for (const ret of items) {
            if (!mongoose.Types.ObjectId.isValid(ret.product)) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Invalid Product ID." });
            }
            if (!mongoose.Types.ObjectId.isValid(ret.batch)) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Invalid Batch ID." });
            }

            const key = `${String(ret.product)}-${String(ret.batch)}`;
            const idx = saleItemsIndexByKey.get(key);

            if (idx === undefined) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Return item does not match the original sale." });
            }

            const originalItem = sale.items[idx];
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

            const originalQuantity = Number(originalItem.quantity);
            const originalItemTotal = Number(originalItem.total || 0);
            const originalItemDiscount = Number(originalItem.discount || 0);
            const perUnitTotal = originalItemTotal / originalQuantity;
            const perUnitDiscount = originalItemDiscount / originalQuantity;
            const lineTotal = perUnitTotal * returnQuantity;
            const lineDiscount = perUnitDiscount * returnQuantity;

            returnSubTotal += lineTotal;

            returnItems.push({
                product: ret.product,
                batch: ret.batch,
                quantity: returnQuantity,
                unitPrice: Number(originalItem.unitPrice),
                discount: lineDiscount,
                total: lineTotal,
            });

            itemUpdates.push({ idx, quantity: returnQuantity, amount: lineTotal });
        }

        const saleSubTotal = Number(sale.subTotal || 0);
        let returnDiscount = 0;
        let returnTax = 0;

        if (saleSubTotal > 0) {
            const returnRatio = returnSubTotal / saleSubTotal;
            returnDiscount = Number(sale.discount || 0) * returnRatio;
            returnTax = Number(sale.tax || 0) * returnRatio;
        }

        const returnTotalAmount = Math.max(returnSubTotal - returnDiscount + returnTax, 0);

        for (const item of returnItems) {
            const batch = await Batches.findById(item.batch).session(session);
            if (!batch) {
                await session.abortTransaction();
                return res.status(404).json({ success: false, message: "Batch not found." });
            }
            batch.quantity += Number(item.quantity);
            await batch.save({ session });
        }

        const lastReturn = await SaleReturns.findOne().sort({ createdAt: -1 }).session(session);
        let returnNo = "RET-0001";
        if (lastReturn && lastReturn.returnNo) {
            const lastNumber = parseInt(lastReturn.returnNo.split("-")[1]);
            if (!isNaN(lastNumber)) returnNo = `RET-${String(lastNumber + 1).padStart(4, "0")}`;
        }

        const [newReturn] = await SaleReturns.create(
            [{
                returnNo,
                sale: sale._id,
                customer: sale.customer || null,
                channel: sale.channel,
                items: returnItems,
                subTotal: returnSubTotal,
                discount: returnDiscount,
                tax: returnTax,
                totalAmount: returnTotalAmount,
                reason,
                refundMethod,
                createdBy: req.user?.id,
            }],
            { session }
        );

        for (const upd of itemUpdates) {
            const item = sale.items[upd.idx];
            item.returnQuantity = Number(item.returnQuantity || 0) + upd.quantity;
            item.returnAmount = Number(item.returnAmount || 0) + upd.amount;
        }

        const previousReturnTotal = Number(sale.totalReturnAmount || 0);
        const previousCashRefund = Number(sale.cashRefundAmount || 0);
        const previousCreditRefund = Number(sale.creditNoteAmount || 0);

        sale.totalReturnAmount = previousReturnTotal + returnTotalAmount;
        sale.netAmount = Math.max(Number(sale.totalAmount || 0) - sale.totalReturnAmount, 0);

        const refundOwedTotal = Math.max(Number(sale.paidAmount || 0) - sale.netAmount, 0);
        const alreadyRefunded = previousCashRefund + previousCreditRefund;
        const refundThisTime = Math.max(refundOwedTotal - alreadyRefunded, 0);

        let creditNoteDoc = null;

        if (refundThisTime > 0) {
            if (refundMethod === "creditNote") {
                if (sale.customerType !== "registered" || !sale.customer) {
                    await session.abortTransaction();
                    return res.status(400).json({
                        success: false,
                        message: "Credit Note is only available for registered customers."
                    });
                }

                sale.creditNoteAmount = previousCreditRefund + refundThisTime;

                const lastCN = await CreditNotes.findOne().sort({ createdAt: -1 }).session(session);
                let creditNoteNumber = "CN-0001";
                if (lastCN && lastCN.creditNoteNumber) {
                    const lastNum = parseInt(lastCN.creditNoteNumber.split("-")[1]);
                    if (!isNaN(lastNum)) creditNoteNumber = `CN-${String(lastNum + 1).padStart(4, "0")}`;
                }

                const [cn] = await CreditNotes.create(
                    [{
                        creditNoteNumber,
                        customer: sale.customer,
                        sale: sale._id,
                        saleReturn: newReturn._id,
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
                sale.cashRefundAmount = previousCashRefund + refundThisTime;
            }
        }

        const effectivePaid = Math.max(
            0,
            Math.max(0, Number(sale.paidAmount || 0)) -
            Math.max(0, Number(sale.cashRefundAmount || 0)) -
            Math.max(0, Number(sale.creditNoteAmount || 0))
        );

        const newNetAmount = Math.max(Number(sale.netAmount || 0), 0);
        sale.dueAmount = Math.max(newNetAmount - effectivePaid, 0);

        if (newNetAmount <= 0 || sale.dueAmount <= 0) {
            sale.status = "paid";
        } else if (effectivePaid > 0) {
            sale.status = "partial";
        } else {
            sale.status = "unPaid";
        }

        await sale.save({ session });

        await session.commitTransaction();

        const populated = await SaleReturns.findById(newReturn._id)
            .populate("items.product", "name barcode")
            .populate("items.batch", "batchNo")
            .populate("customer", "name")
            .populate("createdBy", "name role");

        return res.status(201).json({
            success: true,
            message: "Sale return processed successfully.",
            data: {
                return: populated,
                creditNote: creditNoteDoc,
                refundedAmount: refundThisTime,
                netAmount: sale.netAmount,
                dueAmount: sale.dueAmount,
                cashRefundAmount: sale.cashRefundAmount,
                creditNoteAmount: sale.creditNoteAmount,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    } finally {
        session.endSession();
    }
};

export const getSaleReturns = async (req, res) => {
    try {
        const returns = await SaleReturns.find()
            .populate("items.product", "name barcode retailPrice wholesalePrice parlorPrice")
            .populate("items.batch", "batchNo expiryDate")
            .populate("customer", "name contactNo")
            .populate("sale", "saleNumber totalAmount paidAmount")
            .populate("createdBy", "name role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Sale returns fetched successfully.",
            data: returns,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};

export const getSaleReturnsBySale = async (req, res) => {
    try {
        const { saleId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(saleId)) {
            return res.status(400).json({ success: false, message: "Invalid Sale ID." });
        }

        const returns = await SaleReturns.find({ sale: saleId })
            .populate("items.product", "name barcode retailPrice wholesalePrice parlorPrice")
            .populate("items.batch", "batchNo expiryDate")
            .populate("customer", "name contactNo")
            .populate("sale", "saleNumber totalAmount paidAmount")
            .populate("createdBy", "name role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Returns for this sale fetched successfully.",
            data: returns,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};
