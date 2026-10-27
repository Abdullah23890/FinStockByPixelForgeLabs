export const createCustomerValidator = async (req, res, next) => {
    
    const {
        name,
        type,
        contactNo,
        address,
    } = req.body;

    if(!name || !type || !contactNo || !address){
        return res.status(400).json({
            success : false,
            message : "All fields are required."
        })
    }
    
    next();

}

export const updateCustomerValidator = async (req, res, next) => {
    
    const {
        name,
        type,
        contactNo,
        address,
    } = req.body;

    if(!name || !type || !contactNo || !address){
        return res.status(400).json({
            success : false,
            message : "All fields are required."
        })
    }
    
    next();

}