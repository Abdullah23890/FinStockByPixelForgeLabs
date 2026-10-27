import mongoose from "mongoose";
import Customers from "../models/Customers.js";
import Sales from "../models/Sales.js";
import SaleReturns from "../models/SaleReturn.js";

export const createCustomer = async (req, res) => {
    try {

        const {
            name,
            type,
            contactNo,
            address
        } = req.body;

        const newCustomer = await Customers.create(
            {
                name,
                type,
                contactNo,
                address,
                createdBy: req.user.id
            }
        );

        const customerResponse = newCustomer.toObject();

        return res.status(201).json({
            success : true,
            message : "Customer Created Successfully.",
            data : customerResponse
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getCustomers = async (req, res) => {
    try {

        const allCustomers = await Customers.find().populate("createdBy", "name role").populate("updatedBy", "name role").sort({ createdAt: -1 });
        if(!allCustomers){
            return res.status(404).json({
                success : false,
                message : "Customers Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Customers Fetched Successfully.",
            data : allCustomers
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const updateCustomer = async (req, res) => {
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
        
        const updatedCustomer = await Customers.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument : "after",
                runValidators : true
            }
        );

        if(!updatedCustomer){
            return res.status(404).json({
                success : false,
                message : "Customer Not Found."
            })
        }

        return res.status(200).json({
            success : true,
            message : "Customer Update Successfully.",
            data : updatedCustomer
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Internal Server Error."
        })
    }
}

export const getCustomerLedger = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid customer id." });
        }

        const customer = await Customers.findById(id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }

        const sales = await Sales.find({ customer: id }).sort({ saleDate: 1, createdAt: 1 });

        // ✅ Fix: proper populate taake ReturnsTab/SaleReturnView mein product names/sale number dikhein
        const returns = await SaleReturns.find({ customer: id })
            .populate("items.product", "name barcode")
            .populate("items.batch", "batchNo")
            .populate("sale", "saleNumber totalAmount paidAmount")
            .populate("createdBy", "name role")
            .sort({ createdAt: 1 });

        const rawEntries = [];

        for (const sale of sales) {
            rawEntries.push({
                date: sale.saleDate || sale.createdAt,
                type: "sale",
                reference: sale.saleNumber,
                description: `Sale — ${sale.items?.length || 0} item(s)`,
                amount: sale.totalAmount || 0,
                sortKey: new Date(sale.saleDate || sale.createdAt).getTime(),
            });

            if (sale.payment && sale.payment.length > 0) {
                for (const pay of sale.payment) {
                    rawEntries.push({
                        date: pay.paymentDate || sale.createdAt,
                        type: "payment",
                        reference: sale.saleNumber,
                        saleId: sale._id,
                        method: pay.paymentMethod,
                        description: pay.notes || pay.refrence || "Payment against sale",
                        amount: pay.amount || 0,
                        sortKey: new Date(pay.paymentDate || sale.createdAt).getTime(),
                    });
                }
            }
        }

        for (const ret of returns) {
            rawEntries.push({
                date: ret.createdAt,
                type: "return",
                reference: ret.returnNo,
                description: ret.reason || `Return against ${ret.sale?.saleNumber || "sale"}`,
                amount: ret.totalAmount || 0,
                sortKey: new Date(ret.createdAt).getTime(),
            });
        }

        rawEntries.sort((a, b) => a.sortKey - b.sortKey);

        let runningBalance = 0;
        const entries = rawEntries.map((e) => {
            if (e.type === "sale") {
                runningBalance += e.amount;
            } else {
                runningBalance -= e.amount;
            }
            const { sortKey, ...rest } = e;
            return { ...rest, runningBalance };
        });

        const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const totalPaid = sales.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
        const totalReturns = returns.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
        const outstanding = sales.reduce((sum, s) => sum + (s.dueAmount || 0), 0);

        return res.status(200).json({
            success: true,
            message: "Customer ledger fetched successfully.",
            data: {
                customer,
                entries,
                sales,
                returns,
                summary: { 
                    totalSales, 
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