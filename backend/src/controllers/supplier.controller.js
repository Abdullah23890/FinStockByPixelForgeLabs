import mongoose from "mongoose";
import Purchases from "../models/Purchases.js";
import Suppliers from "../models/Suppliers.js";
import PurchaseReturns from "../models/PurchaseReturn.js";

export const createSupplier = async (req, res) => {
    try {

        const {
            name,
            contactNo,
            address
        } = req.body;

        const newSupplier = await Suppliers.create(
            {
                name,
                contactNo,
                address,
                createdBy: req.user.id
            }
        );

        const supplierResponse = newSupplier.toObject();

        return res.status(201).json({
            success : true,
            message : "Supplier Created Successfully.",
            data : supplierResponse
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getSuppliers = async (req, res) => {
    try {

        const allSupplier = await Suppliers.find().populate("createdBy", "name role").populate("updatedBy", "name role").sort({ createdAt: -1 });
        if(!allSupplier){
            return res.status(404).json({
                success : false,
                message : "Supplier Not Found"
            })
        }

        return res.status(200).json({
            success : true,
            message : "Supplier Fetched Successfully.",
            data : allSupplier
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getSupplierById = async (req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const findSupplier =  await Suppliers.findById(id).populate("createdBy", "name role").populate("updatedBy", "name role");
        if(!findSupplier){
            return res.status(404).json({
                success : false,
                message : "Supplier Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Supplier Fetched Successfully.",
            data : findSupplier
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const updateSupplier = async(req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const updateData = req.body;
        updateData.updatedBy = req.user.id;

        const updatedSupplier = await Suppliers.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument : "after",
                runValidators : true
            }
        );

        if(!updatedSupplier){
            return res.status(404).json({
                success : false,
                message : "Supplier Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Supplier Update Successfully.",
            data : updatedSupplier
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const deleteSupplier = async(req, res) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const deleteSupplier = await Suppliers.findByIdAndDelete(id);

        if(!deleteSupplier){
            return res.status(404).json({
                success : false,
                message : "Supplier Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Supplier Delete Successfully.",
            data : deleteSupplier
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getSupplierLedger = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid supplier id." });
        }

        const supplier = await Suppliers.findById(id);
        if (!supplier) {
            return res.status(404).json({ success: false, message: "Supplier not found." });
        }

        const purchases = await Purchases.find({ supplier: id }).sort({ purchaseDate: 1, createdAt: 1 });

        const returns = await PurchaseReturns.find({ supplier: id })
            .populate("items.product", "name barcode")
            .populate("items.batch", "batchNo")
            .populate("supplier", "name contactNo")
            .populate("purchase", "purchaseNumber totalAmount paidAmount")
            .populate("createdBy", "name role")
            .sort({ createdAt: 1 });

        const rawEntries = [];

        for (const purchase of purchases) {
            rawEntries.push({
                date: purchase.purchaseDate || purchase.createdAt,
                type: "purchase",
                reference: purchase.purchaseNumber,
                description: `Purchase — ${purchase.items?.length || 0} item(s)`,
                amount: purchase.totalAmount || 0,
                sortKey: new Date(purchase.purchaseDate || purchase.createdAt).getTime(),
            });

            for (const pay of purchase.payment || []) {
                rawEntries.push({
                    date: pay.paymentDate || purchase.createdAt,
                    type: "payment",
                    reference: purchase.purchaseNumber,
                    method: pay.paymentMethod,
                    refrence: pay.refrence,
                    description: pay.notes || pay.refrence || "Payment against purchase",
                    amount: pay.amount || 0,
                    sortKey: new Date(pay.paymentDate || purchase.createdAt).getTime(),
                });
            }
        }

        for (const ret of returns) {
            rawEntries.push({
                date: ret.createdAt,
                type: "return",
                reference: ret.returnNo,
                description: ret.reason || `Return against ${ret.purchase?.purchaseNumber || "purchase"}`,
                amount: ret.totalAmount || 0,
                sortKey: new Date(ret.createdAt).getTime(),
            });
        }

        rawEntries.sort((a, b) => a.sortKey - b.sortKey);

        let runningBalance = 0;
        const entries = rawEntries.map((e) => {
            if (e.type === "purchase") runningBalance += e.amount;
            else runningBalance -= e.amount;
            const { sortKey, ...rest } = e;
            return { ...rest, runningBalance };
        });

        const totalPurchased = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const totalPaid = purchases.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
        const totalReturns = returns.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
        const outstanding = purchases.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);

        return res.status(200).json({
            success: true,
            message: "Supplier ledger fetched successfully.",
            data: {
                supplier,
                entries,
                purchases,
                returns,
                summary: { 
                    totalPurchased, 
                    totalPaid, 
                    totalReturns, 
                    outstanding 
                },
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error." 
        });
    }
};