import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MinusCircle, Send } from 'lucide-react';

// Types
interface InventoryStats {
  total: number;
  available: number;
  allocated: number;
}

interface InventoryState {
  [key: string]: InventoryStats;
}

interface AllocationRecord {
  item: string;
  amount: number;
  location: string;
  date: string;
}

const ResourceManagement = () => {
  // Initial inventory data
  const [inventory, setInventory] = useState<InventoryState>({
    chalk: { total: 100, available: 85, allocated: 15 },
    duster: { total: 50, available: 42, allocated: 8 },
    smartBoard: { total: 10, available: 7, allocated: 3 },
    marker: { total: 200, available: 165, allocated: 35 },
    projector: { total: 15, available: 12, allocated: 3 }
  });

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [allocationAmount, setAllocationAmount] = useState<number>(1);
  const [location, setLocation] = useState<string>('');

  // List of possible locations
  const locations: string[] = [
    'Room 101', 'Room 102', 'Room 103', 'Room 104',
    'Lab A', 'Lab B', 'Conference Room', 'Auditorium'
  ];

  // Allocation history
  const [allocationHistory, setAllocationHistory] = useState<AllocationRecord[]>([]);

  const handleAllocate = (): void => {
    if (!selectedItem || !location) return;

    const item = inventory[selectedItem];
    if (item.available >= allocationAmount) {
      // Update inventory
      setInventory({
        ...inventory,
        [selectedItem]: {
          ...item,
          available: item.available - allocationAmount,
          allocated: item.allocated + allocationAmount
        }
      });

      // Add to history
      const newAllocation: AllocationRecord = {
        item: selectedItem,
        amount: allocationAmount,
        location,
        date: new Date().toLocaleString()
      };

      setAllocationHistory([newAllocation, ...allocationHistory]);

      // Reset form
      setSelectedItem(null);
      setAllocationAmount(1);
      setLocation('');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Resource Management System</h1>
      
      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(inventory).map(([item, stats]) => (
          <Card key={item} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="capitalize">{item}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Total: {stats.total}</p>
                <p className="text-green-600">Available: {stats.available}</p>
                <p className="text-blue-600">Allocated: {stats.allocated}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Allocation Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Allocate Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Item Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Item</label>
              <select 
                className="w-full p-2 border rounded"
                value={selectedItem || ''}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                <option value="">Choose an item</option>
                {Object.keys(inventory).map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setAllocationAmount(Math.max(1, allocationAmount - 1))}
                  className="p-2 rounded hover:bg-gray-100"
                  type="button"
                >
                  <MinusCircle className="w-5 h-5" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 p-2 border rounded text-center"
                />
                <button 
                  onClick={() => setAllocationAmount(allocationAmount + 1)}
                  className="p-2 rounded hover:bg-gray-100"
                  type="button"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <select 
                className="w-full p-2 border rounded"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Select location</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Allocate Button */}
            <button
              onClick={handleAllocate}
              disabled={!selectedItem || !location}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              type="button"
            >
              <Send className="w-4 h-4" />
              <span>Allocate</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Allocation History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allocationHistory.map((allocation, index) => (
              <div key={index} className="p-3 border rounded hover:bg-gray-50">
                <p className="font-medium capitalize">{allocation.item}</p>
                <p className="text-sm text-gray-600">
                  {allocation.amount} units allocated to {allocation.location}
                </p>
                <p className="text-xs text-gray-500">{allocation.date}</p>
              </div>
            ))}
            {allocationHistory.length === 0 && (
              <p className="text-gray-500 text-center">No allocations yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceManagement;