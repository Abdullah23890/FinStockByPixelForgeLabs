export const createUserValidator = async(req, res, next) => {
   
    const {
    name,
    userName,
    password,
    role,
    phone,
    status
   } = req.body;

   if(!name || !userName || !password || !role || !phone || !status){
    return res.status(400).json({
        success : false,
        message : "All fields are required."
    })
   }

   if(password.length <= 8){
    return res.status(400).json({
        success : false,
        message : "Password length must be 8 character."
    })
   }

   next();

}

export const updateUserValidator = async(req, res, next) => {
   
    const {
    name,
    userName,
    password,
    role,
    phone,
    status
   } = req.body;

   if(!name || !userName || !role || !phone || !status){
    return res.status(400).json({
        success : false,
        message : "All fields are required."
    })
   }

   next();

}