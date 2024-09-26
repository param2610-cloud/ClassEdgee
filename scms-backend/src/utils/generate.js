import crypto from 'crypto';
import jwt from 'jsonwebtoken';


// Generate a random user ID (e.g., 8 characters long, alphanumeric)
const generateUserId = (length) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

// Generate a strong random password (e.g., 12 characters long, includes letters, numbers, and symbols)
const generatePassword = (length) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars[randomIndex];
  }
  return password;
};



function generateTokens(userId, accessTokenExpiry, refreshTokenExpiry) {
  const accessToken = jwt.sign(
    { userId: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: accessTokenExpiry }
  );

  const refreshToken = jwt.sign(
    { userId: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: refreshTokenExpiry }
  );

  return { accessToken, refreshToken };
}


export { generateUserId, generatePassword,generateTokens };