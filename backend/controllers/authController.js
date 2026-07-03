import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            // bad request
            return res.status(400).json({
                success: false,
                message: "All field are required",
            })
        }
        const exisitingUser = await prisma.user.findUnique({
            where: {
                email,
            }

        })
        if (exisitingUser) {
            // Conflict
            return res.status(409).json({
                success: false,
                message: "User already exists."
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}