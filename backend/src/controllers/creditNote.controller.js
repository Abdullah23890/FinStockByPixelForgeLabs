import mongoose from "mongoose";
import CreditNotes from "../models/CreditNote.js";

export const getCreditNotes = async (req, res) => {
    try {
        const notes = await CreditNotes.find()
            .populate("customer", "name contactNo")
            .populate("sale", "saleNumber")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Credit notes fetched successfully.",
            data: notes,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

export const getCreditNotesByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Customer ID." 
            });
        }

        const notes = await CreditNotes.find({ customer: customerId })
            .populate("sale", "saleNumber")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Customer credit notes fetched successfully.",
            data: notes,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
        success: false, 
        message: "Internal Server Error." 
        });
    }
};

export const useCreditNote = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { creditNoteId, amount } = req.body;

        if (!mongoose.Types.ObjectId.isValid(creditNoteId)) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Invalid Credit Note ID." });
        }

        const useAmount = Number(amount);
        if (!useAmount || useAmount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Invalid amount." });
        }

        const note = await CreditNotes.findById(creditNoteId).session(session);
        if (!note) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Credit note not found." });
        }

        if (note.status !== "active") {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "This credit note is no longer active." });
        }

        if (useAmount > note.remainingAmount) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Amount exceeds remaining credit note balance (PKR ${note.remainingAmount}).`,
            });
        }

        note.usedAmount += useAmount;
        note.remainingAmount -= useAmount;
        if (note.remainingAmount === 0) note.status = "used";

        await note.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Credit note applied successfully.",
            data: note,
        });
    } catch (error) {
        await session.abortTransaction();
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    } finally {
        session.endSession();
    }
};