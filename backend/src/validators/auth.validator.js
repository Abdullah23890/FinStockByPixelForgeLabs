export const authValidators = async(req, res, next) => {
   
    const {
    userName,
    password
   } = req.body;

   if(!userName || !password){
    return res.status(400).json({
        success : false,
        message : "All fields are required."
    })
   }

   next();

}