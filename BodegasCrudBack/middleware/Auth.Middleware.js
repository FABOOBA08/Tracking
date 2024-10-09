import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, '65941f391decca7db1f2fa708f4efb5f74bd1576c6f836898e209ead253c1447');
    req.user = decoded;  // Adjunta el payload decodificado a la solicitud
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export default authMiddleware;
