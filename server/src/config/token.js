import jwt from "jsonwebtoken"

const genToken = async (userId) => {
    try {
        const token = jwt.sign({userId} , process.env.JWT_SECRET , {expiresIn:process.env.JWT_EXPIRES_IN || "7d"})
return token
    } catch (error) {
        console.log(error)
    }

}

export default genToken
