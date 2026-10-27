export const authRole = (...roles)=> {
    return (req, res, next) => {
        try {

            if(!req.user){
                return res.status(401).json({
                    success : "false",
                    message : "Unauthorized."
                })
            }

            const userRole = req.user.role;
            if(!roles.includes(userRole)){
                return res.status(403).json({
                    success : false,
                    message : "Access Denied."
                })
            }

            next();

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success : false,
                message : "Internal Server Error."
            })
        }
    }
}