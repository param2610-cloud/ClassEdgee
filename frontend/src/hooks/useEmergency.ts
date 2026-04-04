import { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";

interface EmergencyRoom {
  room_number?: string;
  buildings?: {
    building_name?: string;
  };
}

interface EmergencyAlert {
  alert_id: number;
  type?: string;
  severity?: string;
  description?: string;
  status?: string;
  rooms?: EmergencyRoom;
}

const toMessage = (alert: EmergencyAlert | null) => {
  if (!alert) return null;

  const severity = alert.severity ? alert.severity.toUpperCase() : "ALERT";
  const type = alert.type ? alert.type.toUpperCase() : "EMERGENCY";
  const building = alert.rooms?.buildings?.building_name;
  const room = alert.rooms?.room_number;
  const location = [building, room ? `Room ${room}` : null].filter(Boolean).join(" • ");

  return `${severity} ${type}: ${alert.description || "Emergency reported"}${location ? ` (${location})` : ""}`;
};

export const useEmergency = () => {
  const { user, token } = useAuth();
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);

  useEffect(() => {
    if (!token || !user) {
      setActiveAlert(null);
      disconnectSocket();
      return;
    }

    let isMounted = true;

    const fetchCurrentAlert = async () => {
      try {
        const response = await api.get("/api/emergency-alerts");
        const payload = Array.isArray(response.data) ? (response.data as EmergencyAlert[]) : [];
        const current = payload.find((item) => item.status === "active") || null;

        if (isMounted) {
          setActiveAlert(current);
        }
      } catch {
        if (isMounted) {
          setActiveAlert(null);
        }
      }
    };

    void fetchCurrentAlert();

    const socket = getSocket();

    if (!socket) {
      return () => {
        isMounted = false;
      };
    }

    const handleNewEmergency = (payload: EmergencyAlert) => {
      if (payload?.status && payload.status !== "active") {
        return;
      }

      setActiveAlert(payload);
    };

    const handleResolvedEmergency = (payload: { alert_id?: number }) => {
      setActiveAlert((previous) => {
        if (!previous) return null;
        if (!payload?.alert_id) return null;
        return previous.alert_id === payload.alert_id ? null : previous;
      });
    };

    socket.emit("emergency:subscribe", user.institution_id);
    socket.on("emergency:new", handleNewEmergency);
    socket.on("emergency:resolved", handleResolvedEmergency);

    return () => {
      isMounted = false;
      socket.off("emergency:new", handleNewEmergency);
      socket.off("emergency:resolved", handleResolvedEmergency);
    };
  }, [token, user]);

  const message = useMemo(() => toMessage(activeAlert), [activeAlert]);

  return {
    isActive: Boolean(activeAlert),
    message,
    alert: activeAlert,
  };
};
