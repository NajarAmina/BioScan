const permit = (...roles) => {
    return (req, res, next) => {
        // ✅ Log temporaire — à supprimer après diagnostic
        console.log('🔐 permit check | user.role:', req.user?.role, '| roles autorisés:', roles);

        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied', userRole: req.user?.role, required: roles });
        }
        next();
    };
};

module.exports = permit;
