// export const fastapidomain = 'http://192.168.0.158:8000'

const isDevelopment = process.env.NODE_ENV !== 'production';

export const fastapidomain = isDevelopment 
    ? 'http://192.168.0.158:8000'  // Development FastAPI server
    : process.env.F