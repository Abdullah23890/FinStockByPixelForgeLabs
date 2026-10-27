export const createPurchaseValidator = async (req, res, next) => {
  
    const {
        supplier,
        purchaseDate,
        totalAmount
    } = req.body;

    if(!supplier || !purchaseDate || !totalAmount){
        return res.status(400).json({
            success : false,
            message : "Supplier, PurchaseDate, TotalAmount are required."
        })
    }

    next();

}