import mongoose from "mongoose";
import SupplierCreditNotes from "../models/SupplierCreditNote.js";

export const getSupplierCreditNotes = async (req, res) => {
    try {
        const notes = await SupplierCreditNotes.find()
            .populate("supplier", "name contactNo")
            .populate("purchase", "purchaseNumber")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Supplier credit notes fetched successfully.",
            data: notes,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

export const getSupplierCreditNotesBySupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(supplierId)) {
            return res.status(400).json({ success: false, message: "Invalid Supplier ID." });
        }

        const notes = await SupplierCreditNotes.find({ supplier: supplierId })
            .populate("purchase", "purchaseNumber")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Supplier credit notes fetched successfully.",
            data: notes,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};