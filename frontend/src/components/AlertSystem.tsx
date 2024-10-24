import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TriangleAlert, Info, CircleAlert } from 'lucide-react'

interface AlertItem {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

const dummyAlerts: AlertItem[] = [
  { id: '1', message: 'System maintenance scheduled for tonight', severity: 'low', timestamp: '2024-09-08T10:00:00Z' },
  { id: '2', message: 'High CPU usage detected on main server', severity: 'medium', timestamp: '2024-09-08T11:30:00Z' },
  { id: '3', message: 'Critical security update required immediately', severity: 'high', timestamp: '2024-09-08T12:15:00Z' },
  { id: '4', message: 'Backup process completed successfully', severity: 'low', timestamp: '2024-09-08T13:45:00Z' },
  { id: '5', message: 'Network connectivity issues in Building B', severity: 'medium', timestamp: '2024-09-08T14:20:00Z' },
];

const AlertSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>(dummyAlerts);
  const [newAlert, setNewAlert] = useState<Omit<AlertItem, 'id' | 'timestamp'>>({ message: '', severity: 'low' });

  const handleCreateAlert = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newAlertItem: AlertItem = {
      id: (alerts.length + 1).toString(),
      ...newAlert,
      timestamp: new Date().toISOString()
    };
    setAlerts([newAlertItem, ...alerts]);
    setNewAlert({ message: '', severity: 'low' });
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return <Info className="h-4 w-4" />;
      case 'medium':
        return <CircleAlert className="h-4 w-4" />;
      case 'high':
        return <TriangleAlert className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'bg-blue-50 text-blue-900';
      case 'medium':
        return 'bg-yellow-50 text-yellow-900';
      case 'high':
        return 'bg-red-50 text-red-900';
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Alert</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <Input 
              value={newAlert.message} 
              onChange={(e) => setNewAlert({...newAlert, message: e.target.value})} 
              placeholder="Alert Message" 
              required 
            />
            <Select
              value={newAlert.severity}
              onValueChange={(value: 'low' | 'medium' | 'high') => setNewAlert({...newAlert, severity: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Create Alert</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {alerts.map(alert => (
              <Alert key={alert.id} className={`mb-4 ${getSeverityColor(alert.severity)}`}>
                <AlertTitle className="flex items-center">
                  {getSeverityIcon(alert.severity)}
                  <span className="ml-2 font-semibold">
                    {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Alert
                  </span>
                </AlertTitle>
                <AlertDescription>
                  <p>{alert.message}</p>
                  <p className="text-sm mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
                </AlertDescription>
              </Alert>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertSystem;