const { JWT_SECRET } = require("../config")
const jwt = require("jsonwebtoken")
const blacklist = require("blacklist")

const authMiddleware = (req, res, next) => {
    const authentication = req.headers.authorization;

    if (!authentication || !authentication.startsWith('Bearer')) {
        return res.status(403).json({ message: "Forbidden : No token Provided" });
    }

    const token = authentication.split(' ')[1];
    if (blacklist.isBlackListed(token)) {
        return res.status(403).json({ message: "Forbidden :Token has been revoked" })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ message: "Unauthorized:Token has expired" })
        }

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Insufficient Perms" })
        }

        if (!decoded.userStatus || decoded.userStatus !== 'active') {
            return res.status(403).json({ message: "Forbidden : Inactive user" })
        }

        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next()
    } catch (err) {
        console.error(`Authentication erroe : ${err.message}`);
        return res.status(403).json({ message: "Forbidden: Invalid Token" });
    }
}

module.exports = {
    authMiddleware
}