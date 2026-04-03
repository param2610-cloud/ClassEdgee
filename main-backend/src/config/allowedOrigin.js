export const allowedOrigins = [
    // Development
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    // Local network
    'http://192.168.0.158:5173',
    'http://192.168.0.103:5173',
    'http://192.168.1.100:5173',
    'http://192.168.0.193:5173',
    // Production (Vercel)
    'https://classedgee.vercel.app',
    // Add your custom domain here after deployment
    process.env.FRONTEND_URL,
].filter(Boolean);  // Remove undefined values