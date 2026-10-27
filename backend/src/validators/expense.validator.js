export const createExpenseValidator = async (req, res, next) => {
    
    const {
        name,
        category,
        date,
        amount
    } = req.body;

    if(!name || !category || !date || !amount){
        return res.status(400).json({
            success : false,
            message : "All fields are required."
        })
    }

    next();
    
}

export const updateExpenseValidator = async (req, res, next) => {
    
    const {
        name,
        category,
        date,
        amount
    } = req.body;

    if(!name || !category || !date || !amount){
        return res.status(400).json({
            success : false,
            message : "All fields are required."
        })
    }

    next();
    
}