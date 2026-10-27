import mongoose from "mongoose";
import Customers from "../models/Customers.js";
import Batches from "../models/Batches.js";
import Sales from "../models/Sales.js";
import CreditNotes from "../models/CreditNote.js";

export const createSale = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const lastSale = await Sales
            .findOne()
            .sort({ createdAt: -1 })
            .session(session);

        let saleNumber = "SALE-0001";

        if (lastSale) {
            const lastNumber = parseInt(
                lastSale.saleNumber.split("-")[1]
            );

            saleNumber = `SALE-${String(lastNumber + 1).padStart(4, "0")}`;
        }

        const {
            customerType,
            channel,
            customer,
            saleDate,
            items,
            subTotal,
            discount,
            tax,
            totalAmount,
            payment,
            printSize
        } = req.body;

        const total = Number(totalAmount) || 0;

        if (total <= 0) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Total amount must be greater than zero."
            });
        }

        if (!items || items.length === 0) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "At least one sale item is required."
            });
        }

        const isWalkIn = customerType === "walkIn";

        if (customerType === "registered") {

            if (!customer) {
                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: "Customer is required for registered sales."
                });
            }

            if (!mongoose.Types.ObjectId.isValid(customer)) {
                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: "Invalid customer ID."
                });
            }

            const customerExists = await Customers
                .findById(customer)
                .session(session);

            if (!customerExists) {
                await session.abortTransaction();

                return res.status(404).json({
                    success: false,
                    message: "Customer not found."
                });
            }
        }

        // Use client-provided payments if present. Only construct payments server-side when no payment array is provided.
        let payments = Array.isArray(payment) ? [...payment] : [];
        const clientProvidedPayments = payments.length > 0;

        if (!clientProvidedPayments) {
            // If client didn't provide a payments array, construct from flat fields
            if (req.body.creditNote && Number(req.body.creditNoteAmount) > 0) {
                payments.push({
                    amount: Number(req.body.creditNoteAmount),
                    paymentMethod: "creditNote",
                    creditNote: req.body.creditNote,
                    refrence: "",
                    notes: "Credit note applied"
                });
            }

            const flatPaid = Number(req.body.amount || req.body.paidAmount || 0);
            if (flatPaid > 0) {
                payments.push({
                    amount: flatPaid,
                    paymentMethod: req.body.paymentMethod || "cash",
                    refrence: req.body.refrence || "",
                    notes: req.body.notes || ""
                });
            }
        } else {
            // Normalize client payments (ensure amounts are numbers)
            payments = payments
                .map((p) => ({ ...p, amount: Number(p.amount || 0), paymentMethod: p.paymentMethod || "cash" }))
                .filter((p) => Number(p.amount) > 0);
        }

        let paid = 0;
        let finalPayments = [];

        for (const p of payments) {

            const amount = Number(p.amount);

            if (!amount || amount <= 0) {
                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: "Invalid payment amount."
                });
            }

            if (p.paymentMethod === "creditNote") {

                if (customerType !== "registered" || !customer) {

                    await session.abortTransaction();

                    return res.status(400).json({
                        success: false,
                        message: "Credit Note can only be used for registered customers."
                    });
                }

                if (!p.creditNote) {

                    await session.abortTransaction();

                    return res.status(400).json({
                        success: false,
                        message: "Credit Note is required."
                    });
                }

                if (!mongoose.Types.ObjectId.isValid(p.creditNote)) {

                    await session.abortTransaction();

                    return res.status(400).json({
                        success: false,
                        message: "Invalid Credit Note ID."
                    });
                }

                const note = await CreditNotes
                    .findById(p.creditNote)
                    .session(session);

                if (!note) {

                    await session.abortTransaction();

                    return res.status(404).json({
                        success: false,
                        message: "Credit Note not found."
                    });
                }

                if (
                    !note.customer ||
                    note.customer.toString() !== customer.toString()
                ) {

                    await session.abortTransaction();

                    return res.status(400).json({
                        success: false,
                        message: "This Credit Note does not belong to this customer."
                    });
                }

                if (note.status !== "active") {

                    await session.abortTransaction();

                    return res.status(400).json({
                        success: false,
                        message: "This Credit Note is no longer active."
                    });
                }

                const remainingCredit =
                    Number(note.remainingAmount || 0);

                if (amount > remainingCredit) {

                    await session.abortTransaction();

                    return res.status(400).json({
                        success: false,
                        message: `Credit Note balance is only PKR ${remainingCredit}.`
                    });
                }

                note.usedAmount =
                    Number(note.usedAmount || 0) + amount;

                note.remainingAmount =
                    remainingCredit - amount;

                if (note.remainingAmount === 0) {
                    note.status = "used";
                }

                await note.save({ session });
            }

            else {

                const allowedMethods = [
                    "cash",
                    "bank",
                    "jazzCash",
                    "easyPaisa"
                ];

                if (!allowedMethods.includes(p.paymentMethod)) {

                    await session.abortTransaction();

                    return res.status(400).json({
                        success: false,
                        message: "Invalid payment method."
                    });
                }
            }

            finalPayments.push({
                amount,
                paymentMethod: p.paymentMethod,

                creditNote:
                    p.paymentMethod === "creditNote"
                        ? p.creditNote
                        : null,

                refrence: p.refrence || "",
                notes: p.notes || "",

                createdBy: req.user.id
            });

            paid += amount;
        }

        if (isWalkIn && paid < total) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Walk-in sales can't be on credit. Full payment is required."
            });
        }

        const remaining = Math.max(
            total - paid,
            0
        );

        let statusPayment = "unPaid";

        if (paid >= total) {
            statusPayment = "paid";
        }
        else if (paid > 0) {
            statusPayment = "partial";
        }

        const processedItems = [];

        for (const item of items) {

            if (!mongoose.Types.ObjectId.isValid(item.batch)) {

                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: "Invalid Batch ID."
                });
            }

            const batch = await Batches
                .findById(item.batch)
                .session(session);

            if (!batch) {

                await session.abortTransaction();

                return res.status(404).json({
                    success: false,
                    message: "Batch not found."
                });
            }

            const saleQuantity =
                Number(item.quantity);

            if (!saleQuantity || saleQuantity <= 0) {

                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for batch ${batch.batchNo}.`
                });
            }

            if (batch.quantity < saleQuantity) {

                await session.abortTransaction();

                return res.status(400).njson({
                    success: false,
                    message: `Insufficient stock for batch ${batch.batchNo}. Available quantity: ${batch.quantity}`
                });
            }

            if (
                batch.product.toString() !==
                item.product.toString()
            ) {

                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: "Selected batch does not belong to the selected product."
                });
            }

            batch.quantity -= saleQuantity;

            await batch.save({ session });

            const purchasePrice = Number(batch.purchasePrice || 0);
            const unitPrice = Number(item.unitPrice || 0);
            const quantity = saleQuantity;
            const itemDiscount = Number(item.discount || 0);
            const lineTotal = Math.max(unitPrice * quantity - itemDiscount, 0);
            const profit = (unitPrice - purchasePrice) * quantity - itemDiscount;

            processedItems.push({
                product: item.product,
                batch: item.batch,
                quantity,
                returnQuantity: 0,
                unitPrice,
                purchasePrice,
                discount: itemDiscount,
                total: lineTotal,
                returnAmount: 0,
                profit
            });
        }

        const [newSale] = await Sales.create(
            [
                {
                    saleNumber,
                    customerType,
                    channel,
                    customer:
                        customerType === "registered"
                            ? customer
                            : null,
                    saleDate,
                    items: processedItems,
                    payment: finalPayments,
                    subTotal,
                    discount,
                    tax,
                    totalAmount: total,
                    paidAmount: paid,
                    dueAmount: remaining,
                    totalReturnAmount: 0,
                    netAmount: total,
                    cashRefundAmount: 0,
                    creditNoteAmount: 0,
                    status: statusPayment,
                    printSize,
                    createdBy: req.user.id
                }
            ],
            { session }
        );

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Sale created successfully.",
            data: newSale
        });

    } catch (error) {

        await session.abortTransaction();

        console.log("Create Sale Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });

    } finally {

        session.endSession();
    }
};

export const getSales = async (req, res) => {
    try {
        const allSales = await Sales.find()
            .populate("customer", "name type contactNo")
            .populate("items.product", "name retailPrice wholesalePrice parlorPrice barcode")
            .populate("items.batch", "batchNo expiryDate purchasePrice")
            .populate("createdBy", "name role")
            .populate("updatedBy", "name role")
            .populate("payment.createdBy", "name role")
            .sort({ createdAt: -1 });

        if (!allSales) {
            return res.status(404).json({
                success: false,
                message: "Sales Not Found."
            })
        }

        return res.status(200).json({
            success: true,
            message: "Sales Fetched Successfully.",
            data: allSales
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        })
    }
}

export const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Sale ID." });
        }

        const sale = await Sales.findById(id)
            .populate("customer", "name type contactNo")
            .populate("items.product", "name retailPrice wholesalePrice parlorPrice barcode")
            .populate("items.batch", "batchNo expiryDate")
            .populate("createdBy", "name role")
            .populate("payment.createdBy", "name role");

        if (!sale) {
            return res.status(404).json({ success: false, message: "Sale not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Sale fetched successfully.",
            data: sale,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error." 
        });
    }
};

export const addSalePayment = async (req, res) => {
    try {
        const {
            amount,
            paymentMethod,
            refrence,
            notes,
        } = req.body;

        const { saleId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(saleId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Sale ID."
            });
        }

        const paid = Number(amount);
        if (paid <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Amount."
            });
        }

        const findSale = await Sales.findById(saleId);
        if (!findSale) {
            return res.status(404).json({
                success: false,
                message: "Sale Not Found."
            });
        }

        const currentDueAmount = Math.max(Number(findSale.dueAmount || 0), 0);

        if (paid > currentDueAmount) {
            return res.status(400).json({
                success: false,
                message: `Paid amount exceeds due amount. Due: PKR ${currentDueAmount.toFixed(2)}`
            });
        }

        if (paymentMethod === "creditNote") {
            return res.status(400).json({
                success: false,
                message: "Credit note payments can only be applied at the time of sale creation, not via Add Payment."
            });
        }

        const allowedMethods = ["cash", "bank", "jazzCash", "easyPaisa"];
        if (!allowedMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method."
            });
        }

        findSale.payment.push({
            amount: paid,
            paymentMethod,
            refrence: refrence || "",
            notes: notes || "",
            createdBy: req.user.id
        });

        findSale.paidAmount = Number(findSale.paidAmount || 0) + paid;

        // Recalculate net due amount taking returns and refunds into account
        const effectivePaid = Math.max(
            0,
            Number(findSale.paidAmount || 0) -
            Number(findSale.cashRefundAmount || 0) -
            Number(findSale.creditNoteAmount || 0)
        );
        const netAmount = Math.max(Number(findSale.netAmount ?? (findSale.totalAmount - Number(findSale.totalReturnAmount || 0))), 0);
        findSale.dueAmount = Math.max(netAmount - effectivePaid, 0);

        if (findSale.dueAmount === 0 || netAmount <= 0) {
            findSale.status = "paid";
        } else if (effectivePaid > 0) {
            findSale.status = "partial";
        } else {
            findSale.status = "unPaid";
        }

        await findSale.save();

        const populatedSale = await Sales.findById(findSale._id)
            .populate("customer", "name type contactNo")
            .populate("items.product", "name retailPrice wholesalePrice parlorPrice barcode")
            .populate("items.batch", "batchNo expiryDate purchasePrice")
            .populate("createdBy", "name role")
            .populate("updatedBy", "name role")
            .populate("payment.createdBy", "name role");

        return res.status(200).json({
            success: true,
            message: "Payment added successfully.",
            data: populatedSale
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};

export const deleteSale = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        const sale = await Sales.findById(id).session(session);
        if (!sale) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Sale not found."
            });
        }

        if (Number(sale.paidAmount) > 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Cannot delete a sale that has recorded payments. Use a return instead.",
            });
        }

        for (const item of sale.items) {
            const batch = await Batches.findById(item.batch).session(session);
            if (batch) {
                batch.quantity += Number(item.quantity);
                await batch.save({ session });
            }
        }

        await Sales.deleteOne({ _id: id }).session(session);

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Sale deleted and stock restored successfully.",
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
}
