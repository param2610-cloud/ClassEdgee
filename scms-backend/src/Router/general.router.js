import e from "express"
import jwt from 'jsonwebtoken';

const router = e.Router();
function validateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded; // Attach decoded token data (e.g., user info) to req object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token.' });
    }
}

router.get('/validate-token', validateToken, (req, res) => {
    res.json({ message: 'Token is valid', user: req.user });
});
export default router