export const createCategoryValidator = async (req, res, next) => {

    const {
        name
    } = req.body;

    if(!name){
        return res.status(400).json({
            success : false,
            message : "Nam are required."
        })
    }

    next();

}

export const updateCategoryValidator = async (req, res, next) => {

    const {
        name
    } = req.body;

    if(!name){
        return res.status(400).json({
            success : false,
            message : "Nam are required."
        })
    }

    next();

}