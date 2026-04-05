import path from "path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env.test") });

process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET ||= "test-access-secret";
process.env.REFRESH_TOKEN_SECRET ||= "test-refresh-secret";
process.env.JWT_SECRET ||= process.env.ACCESS_TOKEN_SECRET;
process.env.PORT ||= "3001";
process.env.LOCAL_IP ||= "localhost";
process.env.FASTAPI_HOST ||= "localhost";
