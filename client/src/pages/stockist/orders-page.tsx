import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function StockistOrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('active');

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders/stockist'],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, we'll use mock orders
      return [
        {
          id: 1,
          orderNumber: 'ET78945',
          customerName: 'Addis Café & Restaurant',
          customerPhone: '+251912345678',
          distance: 0.5,
          status: 'placed',
          items: '2× Heineken Beer, 1× Coca-Cola Crate',
          deliveryFee: 50,
          margin: 150,
          subtotal: 880,
          vatAmount: 132,
          total: 1062,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          orderNumber: 'ET78932',
          customerName: 'Bole Restaurant',
          customerPhone: '+251923456789',
          distance: 0.8,
          status: 'delivering',
          items: '3× St. George Beer, 2× Water (Crate)',
          deliveryFee: 70,
          margin: 220,
          subtotal: 720,
          vatAmount: 108,
          total: 898,
          createdAt: new Date(Date.now() - 30 * 60000).toISOString() // 30 mins ago
        },
        {
          id: 3,
          orderNumber: 'ET78901',
          customerName: 'Merkato Café',
          customerPhone: '+251934567890',
          distance: 1.2,
          status: 'delivered',
          items: '2× Dashen Beer, 1× Sprite Crate',
          deliveryFee: 80,
          margin: 180,
          subtotal: 810,
          vatAmount: 121.5,
          total: 1011.5,
          createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
          deliveredAt: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
        },
        {
          id: 4,
          orderNumber: 'ET78890',
          customerName: 'Piazza Restaurant',
          customerPhone: '+251945678901',
          distance: 1.5,
          status: 'completed',
          items: '1× Heineken Beer, 2× Ambo Water',
          deliveryFee: 90,
          margin: 130,
          subtotal: 625,
          vatAmount: 93.75,
          total: 808.75,
          createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
          deliveredAt: new Date(Date.now() - 23 * 3600000).toISOString(), // 23 hours ago
          receiptIssued: true
        }
      ];
    },
  });

  // Filter orders based on active tab
  const activeOrders = orders?.filter(order => 
    order.status === 'placed' || order.status === 'delivering'
  ) || [];
  
  const completedOrders = orders?.filter(order => 
    order.status === 'delivered' || order.status === 'completed'
  ) || [];

  const handleAcceptOrder = (orderId: number) => {
    // In a real app, this would call the API to update the order status
    toast({
      title: 'Order Accepted',
      description: 'You can now proceed with the delivery.',
    });
  };

  const handleRejectOrder = (orderId: number) => {
    // In a real app, this would call the API to reject the order
    toast({
      title: 'Order Rejected',
      description: 'The order has been rejected.',
    });
  };

  const handleMarkAsDelivered = (orderId: number) => {
    // In a real app, this would call the API to update the order status
    toast({
      title: 'Order Marked as Delivered',
      description: 'The order has been successfully delivered.',
    });
  };

  const handleCallCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <MainLayout title="Orders">
      <div className="px-4 py-3">
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
              </div>
            ) : activeOrders.length > 0 ? (
              <div className="space-y-4">
                {activeOrders.map(order => (
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
                      
                      <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Delivery Fee</p>
                          <p className="font-medium text-gray-800">{order.deliveryFee} ETB</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Your Margin</p>
                          <p className="font-medium text-green-600">{order.margin} ETB</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Order</p>
                          <p className="font-medium text-gray-800">{order.total.toFixed(0)} ETB</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mb-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1" 
                          onClick={() => handleCallCustomer(order.customerPhone)}
                        >
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
                            className="mr-2"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          Call Customer
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                        >
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
                            className="mr-2"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          Message
                        </Button>
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
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-600">No active orders at the moment</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
              </div>
            ) : completedOrders.length > 0 ? (
              <div className="space-y-4">
                {completedOrders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-800">Order #{order.orderNumber}</h4>
                          <p className="text-xs text-gray-500">
                            {order.customerName}
                            {order.deliveredAt && ` • Delivered: ${new Date(order.deliveredAt).toLocaleString()}`}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={order.status === 'delivered' 
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100" 
                            : "bg-green-100 text-green-800 hover:bg-green-100"
                          }
                        >
                          {order.status === 'delivered' ? 'Delivered' : 'Completed'}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Items:</p>
                        <p className="text-sm text-gray-800">{order.items}</p>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm mb-2">
                        <div>
                          <p className="text-gray-600">Your Margin</p>
                          <p className="font-medium text-green-600">{order.margin} ETB</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Order</p>
                          <p className="font-medium text-gray-800">{order.total.toFixed(0)} ETB</p>
                        </div>
                      </div>
                      
                      {order.status === 'delivered' && (
                        <div className="mt-3 flex justify-end">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            VAT Receipt Pending
                          </Badge>
                        </div>
                      )}
                      
                      {order.status === 'completed' && order.receiptIssued && (
                        <div className="mt-3 flex justify-end">
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                            VAT Receipt Issued
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-600">No completed orders yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
