export const isAdmin = async (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    }
    return res.status(403).json({
        success: false,
        message: "Access Denied. U don't have the access to update roles"
    })
}