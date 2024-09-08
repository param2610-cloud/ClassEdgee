import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Resource {
  id: string;
  name: string;
  type: string;
  available: boolean;
}

const dummyResources: Resource[] = [
  { id: '1', name: 'Conference Room A', type: 'Room', available: true },
  { id: '2', name: 'Projector', type: 'Equipment', available: false },
  { id: '3', name: 'Laptop', type: 'Device', available: true },
  { id: '4', name: 'Whiteboard', type: 'Equipment', available: true },
];

const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>(dummyResources);
  const [newResource, setNewResource] = useState({ name: '', type: '' });

  const handleAddResource = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newId = (resources.length + 1).toString();
    setResources([...resources, { ...newResource, id: newId, available: true }]);
    setNewResource({ name: '', type: '' });
  };

  const handleUpdateAvailability = (id: string) => {
    setResources(resources.map(resource =>
      resource.id === id ? { ...resource, available: !resource.available } : resource
    ));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Resource</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddResource} className="space-y-4">
            <Input 
              value={newResource.name} 
              onChange={(e) => setNewResource({...newResource, name: e.target.value})} 
              placeholder="Resource Name" 
              required 
            />
            <Input 
              value={newResource.type} 
              onChange={(e) => setNewResource({...newResource, type: e.target.value})} 
              placeholder="Resource Type" 
              required 
            />
            <Button type="submit">Add Resource</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map(resource => (
                <TableRow key={resource.id}>
                  <TableCell>{resource.name}</TableCell>
                  <TableCell>{resource.type}</TableCell>
                  <TableCell>
                    <Badge variant={resource.available ? "default" : "destructive"}>
                      {resource.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline"
                      onClick={() => handleUpdateAvailability(resource.id)}
                    >
                      {resource.available ? 'Mark Unavailable' : 'Mark Available'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceManagement;