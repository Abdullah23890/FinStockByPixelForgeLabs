export const createSaleValidator = async (req, res, next) => {

    const {
        customerType,
        channel,
        saleDate,
        subTotal,
        totalAmount
    } = req.body;

    if(!customerType || !channel || !saleDate || !subTotal || !totalAmount){
        return res.status(400).json({
            success : false,
            message : "customer type, channel, customer, saledate, subtotal & totalamount are required."
        })
    }

    next();

}

export const updateSaleValidator = async (req, res, next) => {

    const {
        customerType,
        channel,
        saleDate,
        subTotal,
        totalAmount
    } = req.body;

    if(!customerType || !channel || !saleDate || !subTotal || !totalAmount){
        return res.status(400).json({
            success : false,
            message : "customer type, channel, customer, saledate, subtotal & totalamount are required."
        })
    }

    next();

}