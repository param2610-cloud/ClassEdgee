// src/hooks/useEmergencyAlert.ts
import { domain } from '@/lib/constant';
import { useState, useEffect } from 'react';

interface EmergencyAlert {
  alert_id: number;
  type: string;
  severity: string;
  description: string;
  status: string;
}

export const useEmergencyAlert = () => {
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const response = await fetch(`${domain}/api/emergency-alerts`);
        const alerts = await response.json();
        setActiveAlerts(alerts);    
      } catch (error) {
        console.error('Failed to fetch emergency alerts:', error);
      }
    };

    // Initial check
    checkAlerts();

    // Poll every 10 seconds
    const interval = setInterval(checkAlerts, 60000);

    return () => clearInterval(interval);
  }, []);

  return { hasActiveEmergency: activeAlerts.length > 0, alerts: activeAlerts };
};