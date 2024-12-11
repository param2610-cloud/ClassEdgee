import React, { useState } from "react";
import {
  AlertCircle,
  Siren,
  MapPin,
  Phone,
  Users,
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

// Type definitions
interface EmergencyContact {
  title: string;
  number: string;
}

interface Building {
  id: string;
  name: string;
  status: "clear" | "alert" | "warning";
}

interface ActiveAlert {
  id: number;
  location: string;
  type: string;
  timestamp: string;
  severity: "Low" | "Medium" | "Critical";
}

const AlertFire: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("main");
  const [evacuationStatus, setEvacuationStatus] = useState<"clear" | "alert">(
    "clear"
  );

  // Mock emergency data - replace with real API calls
  const emergencyContacts: EmergencyContact[] = [
    { title: "Emergency Services", number: "911" },
    { title: "Campus Security", number: "555-0123" },
    { title: "Fire Department", number: "101" },
    { title: "Building Manager", number: "555-0125" },
  ];

  const buildings: Building[] = [
    { id: "main", name: "Main Building", status: "clear" },
    { id: "library", name: "Library", status: "alert" },
    { id: "science", name: "Science Block", status: "clear" },
    { id: "admin", name: "Admin Block", status: "clear" },
  ];

  const getStatusColor = (status: Building["status"]): string => {
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

  const renderEmergencyAlert = (): JSX.Element | null => {
    if (evacuationStatus === "alert") {
      return (
        <UIAlert
          variant="destructive"
          className="mb-4 border-red-600 bg-red-50"
        >
          <AlertCircle className="h-6 w-6" />
          <AlertTitle className="text-red-600 text-lg font-bold">
            EMERGENCY: FIRE ALERT
          </AlertTitle>
          <AlertDescription className="text-red-600">
            Immediate evacuation required. Please proceed to your nearest
            emergency exit. Follow the evacuation routes shown below.
          </AlertDescription>
        </UIAlert>
      );
    }
    return null;
  };

  const simulateEmergency = (): void => {
    function playBeep() {
      // Use the Audio API to play the sound
      const beepSound = new Audio("/siren-alert.mp3");
      beepSound.play();
    }

    playBeep();
    setEvacuationStatus("alert");
    setActiveAlerts([
      {
        id: 1,
        location: "Library - Second Floor",
        type: "Fire Detected",
        timestamp: new Date().toISOString(),
        severity: "Critical",
      },
    ]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      {renderEmergencyAlert()}

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
                    Status:{" "}
                    {building.status === "clear" ? "All Clear" : "Alert"}
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
                    {contact.number}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evacuation Routes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Evacuation Routes
            </CardTitle>
            <CardDescription>
              Primary and secondary evacuation routes for {selectedBuilding}{" "}
              building
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Primary Route</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <span>Main Entrance</span>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <span>Central Corridor</span>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <span>Emergency Exit A</span>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Secondary Route</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <span>Side Entrance</span>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <span>West Corridor</span>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <span>Emergency Exit B</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Siren className="h-5 w-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAlerts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No active alerts
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 border rounded-lg bg-red-50 border-red-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-red-600">
                        {alert.type}
                      </span>
                      <Badge variant="destructive">{alert.severity}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{alert.location}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Controls - Remove in production */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
          <CardDescription>For testing purposes only</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={simulateEmergency}>
            Simulate Fire Emergency
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertFire;
