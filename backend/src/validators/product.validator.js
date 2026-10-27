export const createProductValidator = async (req, res, next) => {
    
    const {
        name,
        category,
        barcode,
        retailPrice,
        wholesalePrice,
        // parlorPrice,
        status
    } = req.body;

    if(!name || !category || !barcode || !retailPrice || !wholesalePrice || !status){
        return res.status(400).json({
            success : false,
            message : "All fields are required."
        })
    }

    next();

}

export const updateProductValidator = async (req, res, next) => {
    
    const {
        name,
        category,
        barcode,
        retailPrice,
        wholesalePrice,
        // parlorPrice,
        status
    } = req.body;

    if(!name || !category || !barcode || !retailPrice || !wholesalePrice || !status){
        return res.status(400).json({
            success : false,
            message : "All fields are required."
        })
    }

    next();

}