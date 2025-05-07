import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function StockistInventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('current');
  const [editMode, setEditMode] = useState(false);
  
  // Track edited quantities
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Fetch stockist inventory
  const { data: inventory, isLoading } = useQuery({
    queryKey: [`/api/stockists/${user?.id}/inventory`],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, we'll use mock inventory
      return [
        {
          id: 1,
          stockistId: user?.id,
          beverageId: 1,
          quantity: 12,
          beverage: {
            id: 1,
            name: 'Heineken',
            description: '330ml × 24',
            category: 'beer',
            unitPrice: 265
          }
        },
        {
          id: 2,
          stockistId: user?.id,
          beverageId: 2,
          quantity: 8,
          beverage: {
            id: 2,
            name: 'Coca-Cola',
            description: '500ml × 24',
            category: 'soft-drinks',
            unitPrice: 350
          }
        },
        {
          id: 3,
          stockistId: user?.id,
          beverageId: 3,
          quantity: 2,
          beverage: {
            id: 3,
            name: 'St. George Beer',
            description: '330ml × 24',
            category: 'beer',
            unitPrice: 240
          }
        },
        {
          id: 4,
          stockistId: user?.id,
          beverageId: 4,
          quantity: 5,
          beverage: {
            id: 4,
            name: 'Ambo Water',
            description: '500ml × 20',
            category: 'water',
            unitPrice: 180
          }
        },
        {
          id: 5,
          stockistId: user?.id,
          beverageId: 5,
          quantity: 6,
          beverage: {
            id: 5,
            name: 'Dashen Beer',
            description: '330ml × 24',
            category: 'beer',
            unitPrice: 230
          }
        },
        {
          id: 6,
          stockistId: user?.id,
          beverageId: 6,
          quantity: 4,
          beverage: {
            id: 6,
            name: 'Sprite Crate',
            description: '500ml × 24',
            category: 'soft-drinks',
            unitPrice: 350
          }
        }
      ];
    },
    onSuccess: (data) => {
      // Initialize quantities state with current values
      const initialQuantities: Record<number, number> = {};
      data.forEach(item => {
        initialQuantities[item.beverageId] = item.quantity;
      });
      setQuantities(initialQuantities);
    }
  });

  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async (data: { stockistId: number, beverageId: number, quantity: number }) => {
      // In a real app, this would call the API
      const res = await apiRequest('POST', '/api/stockists/inventory', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stockists/${user?.id}/inventory`] });
      toast({
        title: 'Inventory Updated',
        description: 'Your inventory has been successfully updated.',
      });
      setEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Filter inventory by category
  const beerItems = inventory?.filter(item => item.beverage.category === 'beer') || [];
  const softDrinkItems = inventory?.filter(item => item.beverage.category === 'soft-drinks') || [];
  const waterItems = inventory?.filter(item => item.beverage.category === 'water') || [];
  const otherItems = inventory?.filter(item => 
    !['beer', 'soft-drinks', 'water'].includes(item.beverage.category)
  ) || [];

  // Get low stock items
  const lowStockItems = inventory?.filter(item => item.quantity <= 2) || [];

  const handleQuantityChange = (beverageId: number, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity >= 0) {
      setQuantities(prev => ({
        ...prev,
        [beverageId]: quantity
      }));
    }
  };

  const handleSaveInventory = () => {
    // Convert quantities to update requests
    const updatePromises = Object.entries(quantities).map(([beverageId, quantity]) => {
      const inventoryItem = inventory?.find(item => item.beverageId === parseInt(beverageId));
      if (inventoryItem && inventoryItem.quantity !== quantity) {
        return updateInventoryMutation.mutate({
          stockistId: user?.id || 0,
          beverageId: parseInt(beverageId),
          quantity
        });
      }
      return Promise.resolve();
    });
    
    // Update all changed items
    Promise.all(updatePromises)
      .then(() => {
        toast({
          title: 'Inventory Updated',
          description: 'All inventory items have been updated successfully.',
        });
        setEditMode(false);
      })
      .catch((error) => {
        toast({
          title: 'Update Failed',
          description: 'Failed to update some inventory items.',
          variant: 'destructive',
        });
      });
  };

  const renderInventoryItem = (item: any) => (
    <div key={item.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center">
        <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
          {item.beverage.category === 'beer' ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-500"
            >
              <path d="M17 11.6V2a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v9.6" />
              <path d="M16 11.6v8.8a1.6 1.6 0 0 1-1.6 1.6H9.6a1.6 1.6 0 0 1-1.6-1.6v-8.8" />
              <path d="M12 7v3" />
              <path d="M15.4 11.6v0a1.4 1.4 0 0 0-1.4-1.4H10a1.4 1.4 0 0 0-1.4 1.4v0" />
            </svg>
          ) : item.beverage.category === 'soft-drinks' ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-500"
            >
              <path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8" />
              <path d="M5 8h14" />
              <path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0" />
              <path d="m12 8-1-6" />
              <path d="M12 8v0" />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-500"
            >
              <path d="M14.5 2v16.74a2 2 0 0 1-1.41 1.91l-1.72.43a1.97 1.97 0 0 1-.98 0l-1.72-.43a2 2 0 0 1-1.41-1.91V2" />
              <path d="M5.5 8h14" />
              <path d="M5.5 14h14" />
              <path d="M5.5 20h14" />
              <path d="M5.5 2v20" />
              <path d="M19.5 2v20" />
            </svg>
          )}
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{item.beverage.name}</h4>
          <p className="text-xs text-gray-500">{item.beverage.description}</p>
        </div>
      </div>
      <div className="text-right">
        {editMode ? (
          <div className="w-20">
            <Input 
              type="number" 
              min="0"
              value={quantities[item.beverageId] || 0}
              onChange={(e) => handleQuantityChange(item.beverageId, e.target.value)}
              className="h-8 text-right"
            />
          </div>
        ) : (
          <>
            <Badge 
              variant="outline" 
              className={item.quantity <= 2 
                ? "bg-red-100 text-red-800 hover:bg-red-100" 
                : "bg-green-100 text-green-800 hover:bg-green-100"
              }
            >
              {item.quantity <= 2 ? 'Low Stock' : 'In Stock'}
            </Badge>
            <p className="text-sm text-gray-800 mt-1">{item.quantity} crates</p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <MainLayout title="Inventory">
      <div className="px-4 py-3">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading font-medium text-lg text-gray-800">Manage Inventory</h2>
          {editMode ? (
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleSaveInventory}
                disabled={updateInventoryMutation.isPending}
              >
                {updateInventoryMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setEditMode(true)}
            >
              Edit Inventory
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
          </div>
        ) : inventory?.length ? (
          <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="current">Current Stock</TabsTrigger>
              <TabsTrigger value="category">By Category</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {inventory.map(renderInventoryItem)}
                  </div>
                </CardContent>
              </Card>
              
              {!editMode && lowStockItems.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-heading font-medium text-gray-800 mb-2">Low Stock Alert</h3>
                  <Card className="bg-red-50 border border-red-100">
                    <CardContent className="p-3">
                      <p className="text-sm text-red-800 mb-2">
                        The following items need replenishment:
                      </p>
                      <ul className="text-sm space-y-1">
                        {lowStockItems.map(item => (
                          <li key={item.id} className="text-gray-800">
                            • {item.beverage.name}: <span className="font-medium">{item.quantity} crates left</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        variant="secondary" 
                        className="w-full mt-3" 
                      >
                        Request Van Replenishment
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="category">
              <div className="space-y-4">
                {beerItems.length > 0 && (
                  <div>
                    <h3 className="font-heading font-medium text-gray-800 mb-2">Beer</h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                          {beerItems.map(renderInventoryItem)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {softDrinkItems.length > 0 && (
                  <div>
                    <h3 className="font-heading font-medium text-gray-800 mb-2">Soft Drinks</h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                          {softDrinkItems.map(renderInventoryItem)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {waterItems.length > 0 && (
                  <div>
                    <h3 className="font-heading font-medium text-gray-800 mb-2">Water</h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                          {waterItems.map(renderInventoryItem)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {otherItems.length > 0 && (
                  <div>
                    <h3 className="font-heading font-medium text-gray-800 mb-2">Other Beverages</h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                          {otherItems.map(renderInventoryItem)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">No inventory items found</p>
            <Button 
              variant="secondary" 
              className="mt-4"
            >
              Add Inventory Items
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
