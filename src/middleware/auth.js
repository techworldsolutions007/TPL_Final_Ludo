import jwt from "jsonwebtoken";
import Profile from "../model/Profile.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];


  try {
    const decoded = jwt.decode(token);
    const user = await Profile.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token: user not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.log('JWT verification error:', err);
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Restrict access to admins only
export const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admins only' });
};


export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    console.log(process.env.JWT_SECRET);
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const player = await Profile.findById(payload.id);
    if (!player) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    req.user = player;
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

