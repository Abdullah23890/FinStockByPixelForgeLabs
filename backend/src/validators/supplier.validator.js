export const createSupplierValidator = async (req, res, next) => {
    
    const {
        name,
        contactNo,
        address
    } = req.body;

    if(!name || !contactNo || !address){
        return res.status(400).json({
            success : false,
            message : "All fields are required."
        })
    }

    next();

}

export const updateSupplierValidator = async (req, res, next) => {
    
    const {
        name,
        contactNo,
        address
    } = req.body;

    if(!name || !contactNo || !address){
        return res.status(400).json({
            success : false,
            message : "All fields are required."
        })
    }

    next();

}