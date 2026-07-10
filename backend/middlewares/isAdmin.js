export const isAdmin = async (req, res, next) => {
    if (req.user?.roles.some((role) => role.name === 'ADMIN')) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: "Access Denied. Admin priviledges required"
    })
}