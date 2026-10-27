import mongoose from "mongoose";
import Purchases from "../models/Purchases.js";
import Batches from "../models/Batches.js";
import SupplierCreditNotes from "../models/SupplierCreditNote.js";

export const createPurchase = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const lastPurchase = await Purchases.findOne().sort({ createdAt: -1 }).session(session);
        let purchaseNumber = "PUR-0001";

        if (lastPurchase) {
            const lastNumber = parseInt(lastPurchase.purchaseNumber.split("-")[1]);
            purchaseNumber = `PUR-${String(lastNumber + 1).padStart(4, "0")}`;
        }

        const { supplier, purchaseDate, items, totalAmount, payment } = req.body;

        const total = Number(totalAmount) || 0;

        if (total <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Total amount must be greater than zero." });
        }

        if (!items || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "At least one purchase item is required." });
        }

        if (!supplier || !mongoose.Types.ObjectId.isValid(supplier)) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Valid supplier is required." });
        }

        const payments = Array.isArray(payment) ? [...payment] : [];

        let paid = 0;
        const finalPayments = [];

        for (const p of payments) {
            const amount = Number(p.amount);

            if (!amount || amount <= 0) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Invalid payment amount." });
            }

            if (p.paymentMethod === "creditNote") {
                if (!p.creditNote || !mongoose.Types.ObjectId.isValid(p.creditNote)) {
                    await session.abortTransaction();
                    return res.status(400).json({ success: false, message: "Invalid Credit Note ID." });
                }

                const note = await SupplierCreditNotes.findById(p.creditNote).session(session);
                if (!note) {
                    await session.abortTransaction();
                    return res.status(404).json({ success: false, message: "Credit Note not found." });
                }

                if (!note.supplier || note.supplier.toString() !== supplier.toString()) {
                    await session.abortTransaction();
                    return res.status(400).json({ success: false, message: "This Credit Note does not belong to this supplier." });
                }

                if (note.status !== "active") {
                    await session.abortTransaction();
                    return res.status(400).json({ success: false, message: "This Credit Note is no longer active." });
                }

                const remainingCredit = Number(note.remainingAmount || 0);
                if (amount > remainingCredit) {
                    await session.abortTransaction();
                    return res.status(400).json({
                        success: false,
                        message: `Credit Note balance is only PKR ${remainingCredit}.`,
                    });
                }

                note.usedAmount = Number(note.usedAmount || 0) + amount;
                note.remainingAmount = remainingCredit - amount;
                if (note.remainingAmount === 0) note.status = "used";

                await note.save({ session });

                finalPayments.push({
                    amount,
                    paymentMethod: "creditNote",
                    creditNote: p.creditNote,
                    refrence: "",
                    notes: p.notes || "Credit note applied",
                    createdBy: req.user.id,
                });
            } else {
                const allowedMethods = ["cash", "bank", "jazzCash", "easyPaisa"];
                if (!allowedMethods.includes(p.paymentMethod)) {
                    await session.abortTransaction();
                    return res.status(400).json({ success: false, message: "Invalid payment method." });
                }

                finalPayments.push({
                    amount,
                    paymentMethod: p.paymentMethod,
                    creditNote: null,
                    refrence: p.refrence || "",
                    notes: p.notes || "",
                    createdBy: req.user.id,
                });
            }

            paid += amount;
        }

        if (paid > total) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Total payment cannot exceed purchase amount." });
        }

        const remaining = Math.max(total - paid, 0);

        let purchaseStatus = "unPaid";
        if (paid >= total) purchaseStatus = "paid";
        else if (paid > 0) purchaseStatus = "partial";

        const itemsWithBatchId = [];

        for (const item of items) {
            const { product, batchNo, expiryDate, quantity, purchasePrice } = item;

            if (!Number(quantity) || Number(quantity) <= 0) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: `Invalid quantity for ${batchNo}.` });
            }

            const [newBatch] = await Batches.create(
                [
                    {
                        product,
                        batchNo,
                        quantity: Number(quantity),
                        purchasePrice: Number(purchasePrice),
                        supplier,
                        receivedDate: purchaseDate,
                        createdBy: req.user.id,
                    },
                ],
                { session }
            );

            itemsWithBatchId.push({
                product,
                batchId: newBatch._id,
                batchNo,
                quantity: Number(quantity),
                purchasePrice: Number(purchasePrice),
            });
        }

        const [newPurchase] = await Purchases.create(
            [
                {
                    purchaseNumber,
                    supplier,
                    purchaseDate,
                    items: itemsWithBatchId,
                    payment: finalPayments,
                    totalAmount: total,
                    paidAmount: paid,
                    remainingAmount: remaining,
                    totalReturnAmount: 0,
                    netAmount: total,
                    cashRefundAmount: 0,
                    creditNoteAmount: 0,
                    status: purchaseStatus,
                    createdBy: req.user.id,
                },
            ],
            { session }
        );

        await Batches.updateMany(
            { _id: { $in: itemsWithBatchId.map((it) => it.batchId) } },
            { $set: { purchaseId: newPurchase._id } },
            { session }
        );

        await session.commitTransaction();

        const purchaseResponse = await Purchases.findById(newPurchase._id)
            .populate("supplier", "name contactNo")
            .populate("items.product", "name barcode")
            .populate("createdBy", "name role");

        return res.status(201).json({
            success: true,
            message: "Purchase created successfully.",
            data: purchaseResponse,
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

export const getPurchase = async (req, res) => {
    try {

        const allPurchase = await Purchases.find().populate("supplier", "name contact").populate("items.product", "name barcode").populate("createdBy", "name role").populate("updatedBy", "name role").populate("payment.createdBy", "name role").sort({ createdAt: -1 });
        if (!allPurchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase Not Found."
            })
        }

        return res.status(200).json({
            success: true,
            message: "Puchases Fetched Successfully.",
            data: allPurchase
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        })
    }
}

export const getPurchaseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Purchase ID." });
        }

        const purchase = await Purchases.findById(id)
            .populate("supplier", "name contactNo")
            .populate("items.product", "name barcode")
            .populate("createdBy", "name role")
            .populate("updatedBy", "name role")
            .populate("payment.createdBy", "name role");

        if (!purchase) {
            return res.status(404).json({ success: false, message: "Purchase not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Purchase fetched successfully.",
            data: purchase,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

export const updatePurchase = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { supplier, purchaseDate, items: newItems } = req.body;

        if (!Array.isArray(newItems) || newItems.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ 
                success: false, 
                message: "At least one item is required." 
            });
        }

        const oldPurchase = await Purchases.findById(id).session(session);
        if (!oldPurchase) {
            await session.abortTransaction();
            return res.status(404).json({ 
                success: false, 
                message: "Purchase not found." 
            });
        }

        const oldItems = oldPurchase.items;

        // ✅ Valid batchIds — sirf wahi jo isi purchase ke apne items mein hain
        const validOldBatchIds = new Set(
            oldItems.filter((it) => it.batchId).map((it) => String(it.batchId))
        );

        // ✅ Har naye item ki basic validation (quantity, price)
        for (const it of newItems) {
            if (!it.product || !it.batchNo || !it.expiryDate) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Each item must have product, batchNo, and expiryDate." });
            }
            if (Number(it.quantity) <= 0) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Item quantity must be greater than 0." });
            }
            if (Number(it.purchasePrice) < 0) {
                await session.abortTransaction();
                return res.status(400).json({ 
                    success: false,
                    message: "Item purchase price can't be negative." 
                });
            }

            // ✅ CRITICAL FIX: agar batchId bheji hai, wo isi purchase ki honi chahiye
            if (it.batchId && !validOldBatchIds.has(String(it.batchId))) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "Invalid batch reference — one or more items reference a batch that doesn't belong to this purchase.",
                });
            }
        }

        const newByBatchId = new Map(
            newItems.filter((it) => it.batchId).map((it) => [String(it.batchId), it])
        );

        const finalItems = [];

        // ===== Existing items → updated or removed =====
        for (const oldItem of oldItems) {
            const batchIdStr = String(oldItem.batchId);
            const matchedNew = newByBatchId.get(batchIdStr);

            const batch = await Batches.findById(oldItem.batchId).session(session);
            if (!batch) continue; // batch already deleted somehow — safety net

            if (matchedNew) {
                // ---- Existing item still present → apply quantity diff ----
                const oldQty = Number(oldItem.quantity);
                const newQty = Number(matchedNew.quantity);
                const diff = newQty - oldQty;

                const newBatchQty = batch.quantity + diff;
                if (newBatchQty < 0) {
                    await session.abortTransaction();
                    return res.status(400).json({
                        success: false,
                        message: `Batch "${batch.batchNo}" — stock already sold below the requested quantity.`,
                    });
                }

                batch.quantity = newBatchQty;
                batch.batchNo = matchedNew.batchNo;
                batch.purchasePrice = Number(matchedNew.purchasePrice);
                batch.purchaseId = oldPurchase._id;
                await batch.save({ session });

                finalItems.push({
                    product: matchedNew.product,
                    batchId: batch._id,
                    batchNo: batch.batchNo,
                    quantity: newQty,
                    purchasePrice: batch.purchasePrice,
                });
            } else {
                // ---- Item removed from purchase → reduce/delete batch ----
                const oldQty = Number(oldItem.quantity);
                const newBatchQty = batch.quantity - oldQty;

                if (newBatchQty < 0) {
                    await session.abortTransaction();
                    return res.status(400).json({
                        success: false,
                        message: `Cannot remove item — batch "${batch.batchNo}" stock already sold.`,
                    });
                }

                if (newBatchQty === 0) {
                    await Batches.deleteOne({ _id: batch._id }).session(session);
                } else {
                    batch.quantity = newBatchQty;
                    await batch.save({ session });
                }
            }
        }

        // ===== New items → naya batch create karo =====
        for (const newItem of newItems) {
            if (!newItem.batchId) {
                const [newBatch] = await Batches.create(
                    [
                        {
                            product: newItem.product,
                            batchNo: newItem.batchNo,
                            quantity: Number(newItem.quantity),
                            purchasePrice: Number(newItem.purchasePrice),
                            supplier,
                            receivedDate: purchaseDate,
                            purchaseId: id,
                            createdBy: req.user.id,
                        },
                    ],
                    { session }
                );

                finalItems.push({
                    product: newItem.product,
                    batchId: newBatch._id,
                    batchNo: newItem.batchNo,
                    quantity: Number(newItem.quantity),
                    purchasePrice: Number(newItem.purchasePrice),
                });
            }
        }

        // ✅ Safety check — koi item chhoot to nahi gaya (finalItems ki length newItems se match honi chahiye)
        if (finalItems.length !== newItems.length) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Item mismatch detected during update — please refresh and try again.",
            });
        }

        // ===== Totals recalculate karo =====
        const total = finalItems.reduce((sum, it) => sum + it.quantity * it.purchasePrice, 0);
        const remaining = total - oldPurchase.paidAmount;

        let status = "unPaid";
        if (oldPurchase.paidAmount >= total) status = "paid";
        else if (oldPurchase.paidAmount > 0) status = "partial";

        oldPurchase.supplier = supplier;
        oldPurchase.purchaseDate = purchaseDate;
        oldPurchase.items = finalItems;
        oldPurchase.totalAmount = total;
        oldPurchase.remainingAmount = remaining;
        oldPurchase.status = status;
        oldPurchase.updatedBy = req.user.id;

        await oldPurchase.save({ session });

        await session.commitTransaction();
        session.endSession();

        const updated = await Purchases.findById(id)
            .populate("supplier", "name contactNo")
            .populate("items.product", "name barcode")
            .populate("createdBy", "name role");

        return res.status(200).json({
            success: true,
            message: "Purchase updated successfully.",
            data: updated,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

export const addPayment = async (req, res) => {
    try {
        const {
            amount,
            paymentMethod,
            refrence,
            notes
        } = req.body;
        
        const { purchaseId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Purchase ID."
            });
        }

        const paid = Number(amount);
        if (paid <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Amount."
            });
        }

        const findPurchase = await Purchases.findById(purchaseId);
        if (!findPurchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase Not Found."
            });
        }

        const currentRemaining = Math.max(Number(findPurchase.remainingAmount || 0), 0);

        if (paid > currentRemaining) {
            return res.status(400).json({
                success: false,
                message: `Paid amount exceeds remaining amount. Remaining: PKR ${currentRemaining.toFixed(2)}`
            });
        }

        if (paymentMethod === "creditNote") {
            return res.status(400).json({
                success: false,
                message: "Credit note payments can only be applied at the time of purchase creation, not via Add Payment."
            });
        }

        const allowedMethods = ["cash", "bank", "jazzCash", "easyPaisa"];
        if (!allowedMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method."
            });
        }

        findPurchase.payment.push({
            amount: paid,
            paymentMethod,
            refrence: refrence || "",
            notes: notes || "",
            createdBy: req.user.id
        });

        findPurchase.paidAmount = Number(findPurchase.paidAmount || 0) + paid;

        // Recalculate net remaining amount taking returns and refunds into account
        const effectivePaid = Math.max(
            0,
            Number(findPurchase.paidAmount || 0) -
            Number(findPurchase.cashRefundAmount || 0) -
            Number(findPurchase.creditNoteAmount || 0)
        );
        const netAmount = Math.max(Number(findPurchase.netAmount ?? (findPurchase.totalAmount - Number(findPurchase.totalReturnAmount || 0))), 0);
        findPurchase.remainingAmount = Math.max(netAmount - effectivePaid, 0);

        if (findPurchase.remainingAmount === 0 || netAmount <= 0) {
            findPurchase.status = "paid";
        } else if (effectivePaid > 0) {
            findPurchase.status = "partial";
        } else {
            findPurchase.status = "unPaid";
        }

        await findPurchase.save();

        const populatedPurchase = await Purchases.findById(findPurchase._id)
            .populate("supplier", "name contactNo")
            .populate("items.product", "name barcode")
            .populate("createdBy", "name role")
            .populate("updatedBy", "name role")
            .populate("payment.createdBy", "name role");

        return res.status(200).json({
            success: true,
            message: "Payment added successfully.",
            data: populatedPurchase
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};