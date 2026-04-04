import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let io = null;

const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.replace(/^Bearer\s+/i, "").trim();
  }

  const headerToken = socket.handshake.headers?.authorization;
  if (typeof headerToken === "string" && headerToken.trim()) {
    return headerToken.replace(/^Bearer\s+/i, "").trim();
  }

  return null;
};

const getCorsOrigins = () => {
  const envValue = process.env.CORS_ORIGIN;

  if (!envValue) {
    return [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];
  }

  return envValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

export const initSocket = (httpServer) => {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: getCorsOrigins(),
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = getTokenFromSocket(socket);

      if (!token) {
        return next(new Error("Unauthorized: missing token"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const email = decoded?.email;

      if (!email) {
        return next(new Error("Unauthorized: invalid token payload"));
      }

      const user = await prisma.users.findUnique({
        where: { email },
        select: {
          user_id: true,
          institution_id: true,
          role: true,
        },
      });

      if (!user) {
        return next(new Error("Unauthorized: user not found"));
      }

      socket.data.user = user;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized: invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const institutionId = socket.data.user?.institution_id;

    if (institutionId) {
      socket.join(`institution:${institutionId}`);
    }

    socket.on("emergency:subscribe", (requestedInstitutionId) => {
      const userInstitutionId = socket.data.user?.institution_id;
      const normalizedRequested = Number.parseInt(String(requestedInstitutionId), 10);

      const roomInstitutionId = Number.isNaN(normalizedRequested)
        ? userInstitutionId
        : normalizedRequested;

      if (roomInstitutionId) {
        socket.join(`institution:${roomInstitutionId}`);
      }
    });
  });

  return io;
};

export const getIo = () => io;

export const emitEmergencyNew = (payload, institutionId) => {
  if (!io) return;

  if (institutionId) {
    io.to(`institution:${institutionId}`).emit("emergency:new", payload);
    return;
  }

  io.emit("emergency:new", payload);
};

export const emitEmergencyResolved = (payload, institutionId) => {
  if (!io) return;

  if (institutionId) {
    io.to(`institution:${institutionId}`).emit("emergency:resolved", payload);
    return;
  }

  io.emit("emergency:resolved", payload);
};
