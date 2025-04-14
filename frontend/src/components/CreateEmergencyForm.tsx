import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  Building2, 
  MapPin 
} from 'lucide-react';
import { domain } from '@/lib/constant';

interface Building {
  id: number;
  name: string;
  status:string;
}

interface Room {
  room_id: number;
  room_number: string;
  floor_number: number;
}

const CreateEmergencyAlert = () => {
  const { toast } = useToast();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: 'fire',
    severity: 'low',
    location_id: '',
    description: '',
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      fetchRooms(selectedBuilding);
    }
  }, [selectedBuilding]);

  const fetchBuildings = async () => {
    try {
      const response = await fetch(`${domain}/api/buildings`);
      const data = await response.json();
      console.log(data);
      
      setBuildings(data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch buildings",
      });
    }
  };

  const fetchRooms = async (buildingId: string) => {
    try {
      const response = await fetch(`${domain}/api/buildings/${buildingId}/rooms`);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch rooms",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${domain}/api/emergency-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      console.log(formData);
      console.log( await response.json());
      

      if (!response.ok) {
        throw new Error('Failed to create alert');
      }

      toast({
        title: "Emergency Alert Created",
        description: "The emergency alert has been successfully created and notifications have been sent.",
      });

      // Reset form
      setFormData({
        type: 'fire',
        severity: 'low',
        location_id: '',
        description: '',
      });
      setSelectedBuilding("");

    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create emergency alert",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          Create Emergency Alert
        </CardTitle>
        <CardDescription>
          Create an emergency alert to notify all users in the affected area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Alert Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alert type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fire">Fire</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData({ ...formData, severity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="space-y-4">
              <div>
                <Label className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Building
                </Label>
                <Select
                  value={selectedBuilding}
                  onValueChange={setSelectedBuilding}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem 
                        key={building?.id} 
                        value={building?.id?.toString()}
                      >
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Room
                </Label>
                <Select
                  value={formData.location_id}
                  onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                  disabled={!selectedBuilding}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedBuilding ? "Select room" : "Select building first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem 
                        key={room.room_id} 
                        value={room.room_id.toString()}
                      >
                        Room {room.room_number} (Floor {room.floor_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the emergency..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-32"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            {loading ? "Creating Alert..." : "Create Emergency Alert"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateEmergencyAlert;