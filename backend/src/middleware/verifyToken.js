// verifyToken.js
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js'; // ✅ make sure the path is correct

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Get full user from DB using decoded.id or decoded._id
    const user = await User.findById(decoded.id); // or decoded._id based on your token payload

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // ✅ attach full user object with _id
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default verifyToken;