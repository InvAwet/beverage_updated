import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowUp, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function StockistDashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch stockist inventory
  const { data: inventory, isLoading: isInventoryLoading } = useQuery({
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
        }
      ];
    },
  });

  // Fetch active orders
  const { data: activeOrders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['/api/orders/stockist'],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, we'll use mock orders
      return [
        {
          id: 1,
          orderNumber: 'ET78945',
          customerName: 'Addis Café & Restaurant',
          distance: 0.5,
          status: 'placed',
          items: '2× Heineken Beer, 1× Coca-Cola Crate',
          deliveryFee: 50,
          margin: 150,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          orderNumber: 'ET78932',
          customerName: 'Bole Restaurant',
          distance: 0.8,
          status: 'delivering',
          items: '3× St. George Beer, 2× Water (Crate)',
          deliveryFee: 70,
          margin: 220,
          createdAt: new Date(Date.now() - 30 * 60000).toISOString() // 30 mins ago
        }
      ];
    },
  });

  const handleAcceptOrder = (orderId: number) => {
    // In a real app, this would call the API to update the order status
    console.log('Accepting order', orderId);
    navigate('/stockist/orders');
  };

  const handleRejectOrder = (orderId: number) => {
    // In a real app, this would call the API to reject the order
    console.log('Rejecting order', orderId);
  };

  const handleMarkAsDelivered = (orderId: number) => {
    // In a real app, this would call the API to update the order status
    console.log('Marking order as delivered', orderId);
    navigate('/stockist/orders');
  };

  const handleManageInventory = () => {
    navigate('/stockist/inventory');
  };

  const handleRequestReplenishment = () => {
    // In a real app, this would call the API to request replenishment
    alert('Replenishment request sent to van sales agent');
  };

  // Get beverages with low stock
  const lowStockItems = inventory?.filter(item => item.quantity <= 2) || [];

  return (
    <MainLayout>
      <div className="px-4 py-3">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Today's Deliveries</p>
              <h3 className="font-heading font-semibold text-2xl text-gray-800">5</h3>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                20% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Earnings This Week</p>
              <h3 className="font-heading font-semibold text-2xl text-gray-800">3,450 ETB</h3>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                15% from last week
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Inventory Status */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-heading font-medium text-gray-800">Inventory Status</h2>
            <Button 
              variant="link" 
              className="text-secondary p-0 h-auto"
              onClick={handleManageInventory}
            >
              Update
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {isInventoryLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-6 w-6 border-4 border-secondary border-t-transparent rounded-full"></div>
                  </div>
                ) : inventory?.length ? (
                  inventory.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
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
                              <line x1="12" y1="19" x2="12" y2="5" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <path d="M5 19c0-3.314 3.134-6 7-6 3.866 0 7 2.686 7 6v0c0 .702-.573 1-2 1H7c-1.427 0-2-.298-2-1v0Z" />
                              <path d="M12 16v-7a4 4 0 0 0-4-4h0v1.5" />
                              <path d="M12 9h8s0 2-2 2-6 0-6 0" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{item.beverage.name}</h4>
                          <p className="text-xs text-gray-500">{item.beverage.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
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
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-2 text-gray-600">No inventory items found</p>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="mt-4 w-full border-secondary text-secondary"
                onClick={handleManageInventory}
              >
                Manage Inventory
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Active Orders */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-heading font-medium text-gray-800">Active Orders</h2>
            {activeOrders?.filter(order => order.status === 'placed').length > 0 && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {activeOrders.filter(order => order.status === 'placed').length} New
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            {isOrdersLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin h-6 w-6 border-4 border-secondary border-t-transparent rounded-full"></div>
              </div>
            ) : activeOrders?.length ? (
              activeOrders.map(order => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-800">Order #{order.orderNumber}</h4>
                        <p className="text-xs text-gray-500">{order.customerName} • {order.distance} km away</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={order.status === 'placed' 
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" 
                          : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        }
                      >
                        {order.status === 'placed' ? 'New Order' : 'In Progress'}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Items:</p>
                      <p className="text-sm text-gray-800">{order.items}</p>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mb-4">
                      <div>
                        <p className="text-gray-600">Delivery Fee</p>
                        <p className="font-medium text-gray-800">{order.deliveryFee} ETB</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Your Margin</p>
                        <p className="font-medium text-green-600">{order.margin} ETB</p>
                      </div>
                    </div>
                    
                    {order.status === 'placed' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="border-gray-300 text-gray-700" 
                          onClick={() => handleRejectOrder(order.id)}
                        >
                          Reject
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => handleAcceptOrder(order.id)}
                        >
                          Accept
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="secondary" 
                        className="w-full" 
                        onClick={() => handleMarkAsDelivered(order.id)}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-4 text-center py-6">
                  <p className="text-gray-600">No active orders at the moment</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Replenishment Requests */}
        {lowStockItems.length > 0 && (
          <div className="mb-5">
            <h2 className="font-heading font-medium text-gray-800 mb-3">Replenishment Needed</h2>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex space-x-3">
                    <div className="h-12 w-12 bg-red-100 rounded-md flex items-center justify-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="text-red-500"
                      >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Low Stock Alert</h4>
                      <p className="text-sm text-gray-600">Request van sales replenishment</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <p className="text-sm text-gray-800">
                        {item.beverage.name} ({item.quantity} crates left)
                      </p>
                      <div className="flex items-center">
                        <button className="h-7 w-7 flex items-center justify-center bg-gray-100 rounded-l-md border border-gray-300">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="text-gray-600"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                        <span className="h-7 w-10 flex items-center justify-center border-t border-b border-gray-300 text-sm">10</span>
                        <button className="h-7 w-7 flex items-center justify-center bg-gray-100 rounded-r-md border border-gray-300">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="text-gray-600"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  onClick={handleRequestReplenishment}
                >
                  Request Van Replenishment
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
