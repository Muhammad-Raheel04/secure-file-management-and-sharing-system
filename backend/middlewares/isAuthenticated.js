import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({
                success: false,
                message: "Authorization Missing"
            })
        }
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Access Token Expired"
                })
            }
            return res.status(401).json({
                success: false,
                message: "Access Token is missing or Invalid"
            })
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            },
            include:{
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = {
            id: user.id,
            roles: user.userRoles.map((userRole) => userRole.role)
        }
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}