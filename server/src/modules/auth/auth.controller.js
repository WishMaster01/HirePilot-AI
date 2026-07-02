import genToken from "../../config/token.js"
import prisma from "../../config/prisma.js"
import axios from "axios"
import { calculateLoginRisk } from "../../shared/algorithms/securityRisk.algorithm.js"

const verifyFirebaseToken = async (idToken) => {
    if (!process.env.FIREBASE_WEB_API_KEY) {
        const error = new Error("Firebase server configuration is missing.")
        error.statusCode = 500
        throw error
    }

    let data
    try {
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_WEB_API_KEY}`,
            { idToken }
        )
        data = response.data
    } catch (error) {
        const firebaseMessage = error.response?.data?.error?.message
        const mappedError = new Error(
            firebaseMessage === "CONFIGURATION_NOT_FOUND"
                ? "Firebase Authentication is not configured for this project. Enable Firebase Auth and Google sign-in in the Firebase console."
                : firebaseMessage === "API_KEY_INVALID"
                    ? "Firebase API key is invalid. Check FIREBASE_WEB_API_KEY."
                    : firebaseMessage === "INVALID_ID_TOKEN"
                        ? "Invalid Firebase authentication token."
                        : "Unable to verify Firebase authentication token."
        )
        mappedError.statusCode = firebaseMessage === "INVALID_ID_TOKEN" ? 401 : 500
        throw mappedError
    }

    const firebaseUser = data?.users?.[0]
    if (!firebaseUser?.email) {
        const error = new Error("Invalid Firebase authentication token.")
        error.statusCode = 401
        throw error
    }

    return {
        firebaseUid: firebaseUser.localId,
        name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        email: firebaseUser.email,
        image: firebaseUser.photoUrl,
    }
}


export const googleAuth = async (req,res) => {
    try {
        const { idToken } = req.body
        if (!idToken) {
            return res.status(400).json({ message: "Firebase ID token is required." })
        }

        const { name, email, image } = await verifyFirebaseToken(idToken)
        const existingUser = await prisma.user.findUnique({ where: { email } })
        const lastLoginMinutesAgo = existingUser?.lastLoginAt
            ? Math.round((Date.now() - existingUser.lastLoginAt.getTime()) / 60000)
            : 1440
        const authRisk = calculateLoginRisk({
            failedAttempts: 0,
            ipChange: false,
            deviceChange: false,
            lastLoginMinutesAgo,
        })
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                name,
                imageUrl: image,
                isActive: true,
                lastLoginAt: new Date(),
            },
            create: {
                name,
                email,
                imageUrl: image,
                credits: 100,
                lastLoginAt: new Date(),
            },
        })
        let token = await genToken(user.id)
        res.cookie("token" , token , {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict",
            maxAge:7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({ ...user, authRisk })



    } catch (error) {
        return res.status(error.statusCode || 500).json({message:error.message || `Google auth error ${error}`})
    }
    
}

export const logOut = async (req,res) => {
    try {
        await res.clearCookie("token")
        return res.status(200).json({message:"LogOut Successfully"})
    } catch (error) {
         return res.status(500).json({message:`Logout error ${error}`})
    }
    
}
