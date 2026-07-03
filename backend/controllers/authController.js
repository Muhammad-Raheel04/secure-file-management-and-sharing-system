import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            // bad request
            // missing fields
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const user = await prisma.user.findUnique({
            where: {
                email,
            }
        })
        if (!user) {
            // Not Found
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // unauthorized
            return res.status(401).json({
                success: false,
                message: "Password incorrect"
            })
        }
        const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        await prisma.session.create({
            data: {
                refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 9 * 24 * 60 * 1000)
            }
        })
        return res.status(200).json({
            success: true,
            message: "Login Successfull",
            id: user.id,
            accessToken,
            refreshToken,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}