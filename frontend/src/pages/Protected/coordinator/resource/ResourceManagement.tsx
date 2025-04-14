import { useState, useEffect } from 'react';
import { AlertCircle, Edit, Hammer, Plus, Loader2, Search, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios, { AxiosError } from 'axios';
import { domain } from '@/lib/constant';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useToast } from '@/hooks/use-toast';

// Type definitions
interface Equipment {
  equipment_id: string;
  name: string;
  type: string;
  room_id: string;
  serial_number: string;
  purchase_date: string;
  warranty_end_date: string;
  specifications: string;
  maintenance_schedule: string;
  status: string;
}

interface FormDataType {
  name: string;
  type: string;
  room_id: string;
  serial_number: string;
  purchase_date: string;
  warranty_end_date: string;
  specifications: string;
  maintenance_schedule: string;
}

interface ApiErrorResponse {
  error: string;
  message?: string;
}

interface AnimationVariants {
  [key: string]: {
    opacity?: number;
    y?: number;
    transition?: {
      staggerChildren?: number;
      type?: string;
      stiffness?: number;
    };
  };
}

const EquipmentManagement = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editData, setEditData] = useState<FormDataType | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    type: '',
    room_id: '',
    serial_number: '',
    purchase_date: '',
    warranty_end_date: '',
    specifications: '',
    maintenance_schedule: ''
  });
  const { toast } = useToast();

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${domain}/api/v1/equipment`);
      setEquipment(data);
      setError(null);
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error || error.message;
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error fetching equipment",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${domain}/api/v1/equipment`, formData);
      fetchEquipment();
      setFormData({
        name: '',
        type: '',
        room_id: '',
        serial_number: '',
        purchase_date: '',
        warranty_end_date: '',
        specifications: '',
        maintenance_schedule: ''
      });
      setError(null);
      toast({
        title: "Equipment added",
        description: "The equipment has been added successfully!",
      });
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error || error.message;
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to add equipment",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      setLoading(true);
      await axios.patch(`${domain}/api/v1/equipment/${id}`, { status });
      fetchEquipment();
      toast({
        title: "Status updated",
        description: `Equipment status changed to ${status.replace('_', ' ')}`,
      });
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error || error.message;
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenance = async (id: string, date: string) => {
    try {
      setLoading(true);
      await axios.post(`${domain}/api/v1/equipment/${id}/maintenance`, { maintenance_date: date });
      fetchEquipment();
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error || error.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: Equipment) => {
    setEditMode(item.equipment_id);
    setEditData({
      name: item.name,
      type: item.type,
      room_id: item.room_id,
      serial_number: item.serial_number,
      specifications: item.specifications || '',
      maintenance_schedule: item.maintenance_schedule || '',
      purchase_date: item.purchase_date || '',
      warranty_end_date: item.warranty_end_date || ''
    });
  };

  const cancelEdit = () => {
    setEditMode(null);
    setEditData(null);
  };

  const saveEdit = async (id: string) => {
    if (!editData) return;
    
    try {
      setLoading(true);
      await axios.patch(`${domain}/api/v1/equipment/${id}`, editData);
      fetchEquipment();
      setEditMode(null);
      setEditData(null);
      toast({
        title: "Equipment updated",
        description: "The equipment details have been updated successfully!",
      });
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error || error.message;
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to update equipment",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredEquipment = equipment.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const container: AnimationVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item: AnimationVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 300 
      } 
    }
  };

  return (
    <motion.div 
      className="p-6 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 
        className="text-3xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Equipment Management
      </motion.h1>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-5 w-5 mr-2" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="list" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Equipment List</TabsTrigger>
          <TabsTrigger value="add">Add Equipment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search equipment by name, type or serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="pt-2 pb-2">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between gap-2 border-t">
                    <Skeleton className="h-9 w-[180px]" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredEquipment.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-lg text-gray-600">No equipment found. Add some equipment to get started.</p>
            </motion.div>
          )}

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {!loading && filteredEquipment.map((equipment) => (
                <motion.div 
                  key={equipment.equipment_id} 
                  variants={item}
                  initial="hidden"
                  animate="show"
                  layout
                >
                  <Card className="border overflow-hidden hover:shadow-md transition-shadow">
                    {editMode === equipment.equipment_id ? (
                      <CardContent className="p-4 space-y-4">
                        <Input
                          type="text"
                          value={editData?.name || ''}
                          onChange={(e) => setEditData({ ...editData!, name: e.target.value })}
                          className="mb-3"
                          placeholder="Equipment name"
                        />
                        <Input
                          type="text"
                          value={editData?.type || ''}
                          onChange={(e) => setEditData({ ...editData!, type: e.target.value })}
                          className="mb-3"
                          placeholder="Equipment type"
                        />
                        <Input
                          type="text"
                          value={editData?.serial_number || ''}
                          onChange={(e) => setEditData({ ...editData!, serial_number: e.target.value })}
                          className="mb-3"
                          placeholder="Serial number"
                        />
                        <Input
                          type="text"
                          value={editData?.room_id || ''}
                          onChange={(e) => setEditData({ ...editData!, room_id: e.target.value })}
                          className="mb-3"
                          placeholder="Room ID"
                        />
                        <div className="flex space-x-2 mt-4">
                          <Button 
                            onClick={() => saveEdit(equipment.equipment_id)}
                            className="flex-1"
                            variant="default"
                          >
                            Save
                          </Button>
                          <Button 
                            onClick={cancelEdit}
                            className="flex-1"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    ) : (
                      <>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl font-semibold">{equipment.name}</CardTitle>
                            <Badge className={getStatusColor(equipment.status)}>
                              {equipment.status ? equipment.status.replace('_', ' ') : 'Unknown'}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">{equipment.type}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2 pb-2">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Serial:</span> 
                              <span className="font-medium">{equipment.serial_number}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Room:</span> 
                              <span className="font-medium">{equipment.room_id}</span>
                            </div>
                            {equipment.purchase_date && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Purchased:</span> 
                                <span className="font-medium">
                                  {new Date(equipment.purchase_date).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {equipment.specifications && (
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <div className="flex justify-between cursor-pointer">
                                    <span className="text-gray-500">Specifications:</span> 
                                    <span className="font-medium text-blue-500 flex items-center">
                                      View <InfoIcon className="h-3 w-3 ml-1" />
                                    </span>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Equipment Specifications</h4>
                                    <p className="text-sm">{equipment.specifications}</p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-between gap-2 border-t">
                          <Select 
                            onValueChange={(value) => handleStatusUpdate(equipment.equipment_id, value)}
                            defaultValue={equipment.status || ''}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="in_use">In Use</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => startEdit(equipment)}
                                    variant="outline"
                                    size="icon"
                                    className="transition-transform hover:scale-105"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit Equipment Details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => handleMaintenance(equipment.equipment_id, new Date().toISOString().split('T')[0])}
                                    variant="secondary"
                                    size="icon"
                                    className="transition-transform hover:scale-105"
                                  >
                                    <Hammer className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Schedule Maintenance</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </CardFooter>
                      </>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </TabsContent>

        <TabsContent value="add">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Add New Equipment</CardTitle>
                <CardDescription>Enter the details of the new equipment</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Equipment Name</label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <Input
                        type="text"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Room ID</label>
                      <Input
                        type="text"
                        value={formData.room_id}
                        onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Serial Number</label>
                      <Input
                        type="text"
                        value={formData.serial_number}
                        onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Purchase Date</label>
                      <Input
                        type="date"
                        value={formData.purchase_date}
                        onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Warranty End Date</label>
                      <Input
                        type="date"
                        value={formData.warranty_end_date}
                        onChange={(e) => setFormData({...formData, warranty_end_date: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Specifications</label>
                      <textarea
                        value={formData.specifications}
                        onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Maintenance Schedule</label>
                      <textarea
                        value={formData.maintenance_schedule}
                        onChange={(e) => setFormData({...formData, maintenance_schedule: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full sm:w-auto relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-0 bg-white bg-opacity-20 transition-all duration-300 ease-out group-hover:w-full"></span>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Equipment
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EquipmentManagement;