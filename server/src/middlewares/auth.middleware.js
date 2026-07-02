import jwt from "jsonwebtoken"
import { errorResponse } from "../shared/apiResponse.js"


const isAuth = async (req,res,next) => {
    try {
        let {token} = req.cookies

        if(!token){
            return errorResponse(res, "Authentication required", "Missing token", 401)
        }
        const verifyToken = jwt.verify(token , process.env.JWT_SECRET)
        
        if(!verifyToken){
            return errorResponse(res, "Authentication required", "Invalid token", 401)
        }
        req.userId = verifyToken.userId

        next()
   

    } catch (error) {
        return errorResponse(res, "Authentication required", "Invalid or expired token", 401)
    }
    
}

export default isAuth
