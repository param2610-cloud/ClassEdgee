import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/services/AuthContext";
import {
  AlertCircle,
  Siren,
  MapPin,
  Phone,
  ArrowRight,
  Building,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert as UIAlert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = 'http://localhost:3000/api';

interface Alert {
  alert_id: string;
  type: string;
  severity: string;
  description: string;
  reported_at: string;
}

interface Building {
  id: string;
  name: string;
  status: string;
}

interface Contact {
  title: string;
  number: string;
}

interface EvacuationRoutes {
  building: string;
  routes: {
    primary: {
      steps: string[];
    };
    secondary: {
      steps: string[];
    };
  };
}

const AlertFire = () => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
  const [evacuationRoutes, setEvacuationRoutes] = useState<EvacuationRoutes | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio('/siren-alert.mp3'));

  // Function to play emergency sound
  const playEmergencySound = () => {
    if (audioRef.current) {
      audioRef.current.loop = true; // Make the sound loop
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  // Stop sound when component unmounts or when there are no active alerts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Fetch initial data and set up polling
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsRes, buildingsRes, contactsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/emergency-alerts`),
          fetch(`${API_BASE_URL}/buildings`),
          fetch(`${API_BASE_URL}/emergency-contacts`)
        ]);

        const alerts = await alertsRes.json();
        const buildings = await buildingsRes.json();
        const contacts = await contactsRes.json();

        setActiveAlerts(alerts);
        setBuildings(buildings);
        setEmergencyContacts(contacts);
        
        // Play sound if there are active alerts
        if (alerts.length > 0) {
          playEmergencySound();
        } else {
          // Stop sound if no active alerts
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }

        if (buildings.length > 0) {
          setSelectedBuilding(buildings[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch evacuation routes when selected building changes
  useEffect(() => {
    if (selectedBuilding) {
      fetch(`${API_BASE_URL}/evacuation-routes/${selectedBuilding}`)
        .then(res => res.json())
        .then(data => setEvacuationRoutes(data))
        .catch(error => console.error('Failed to fetch evacuation routes:', error));
    }
  }, [selectedBuilding]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "alert":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "clear":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Only render if there are active alerts
  if (activeAlerts.length === 0) {
    return null;
  }

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="destructive" 
          onClick={handleLogout}
          className="font-semibold"
        >
          Emergency Logout
        </Button>
      </div>
      <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
        <UIAlert variant="destructive" className="mb-4 border-red-600 bg-red-50">
          <AlertCircle className="h-6 w-6" />
          <AlertTitle className="text-red-600 text-lg font-bold">
            EMERGENCY: FIRE ALERT
          </AlertTitle>
          <AlertDescription className="text-red-600">
            Immediate evacuation required. Please proceed to your nearest
            emergency exit. Follow the evacuation routes shown below.
          </AlertDescription>
        </UIAlert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Building Status Panel */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Building Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {buildings.map((building) => (
                  <div
                    key={building.id}
                    className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedBuilding(building.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{building.name}</span>
                      <span
                        className={`h-3 w-3 rounded-full ${getStatusColor(
                          building.status
                        )}`}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Status: {building.status === "clear" ? "All Clear" : "Alert"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                  >
                    <span className="font-medium">{contact.title}</span>
                    <Button variant="outline" size="sm">
                      <a href={`tel:${contact.number}`}>{contact.number}</a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evacuation Routes */}
          {evacuationRoutes && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Evacuation Routes
                </CardTitle>
                <CardDescription>
                  Primary and secondary evacuation routes for {evacuationRoutes.building}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Primary Route</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      {evacuationRoutes.routes.primary.steps.map((step, index, arr) => (
                        <React.Fragment key={index}>
                          <span>{step}</span>
                          {index < arr.length - 1 && (
                            <ArrowRight className="h-4 w-4 mx-2" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Secondary Route</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      {evacuationRoutes.routes.secondary.steps.map((step, index, arr) => (
                        <React.Fragment key={index}>
                          <span>{step}</span>
                          {index < arr.length - 1 && (
                            <ArrowRight className="h-4 w-4 mx-2" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Siren className="h-5 w-5" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.alert_id}
                    className="p-3 border rounded-lg bg-red-50 border-red-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-red-600">
                        {alert.type}
                      </span>
                      <Badge variant="destructive">{alert.severity}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.reported_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AlertFire;