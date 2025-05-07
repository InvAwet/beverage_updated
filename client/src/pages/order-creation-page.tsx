import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import MainLayout from '@/components/layouts/main-layout';
import OrderItem from '@/components/order-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { Beverage } from '@shared/schema';

export default function OrderCreationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { cartItems, updateQuantity, clearCart, subtotal: cartSubtotal, removeFromCart } = useCart();
  const [, navigate] = useLocation();
  const [deliveryTime, setDeliveryTime] = useState<'asap' | 'today' | 'schedule'>('asap');

  // Fetch beverages for the cart
  const { data: beverages, isLoading } = useQuery<Beverage[]>({
    queryKey: ['/api/beverages'],
    queryFn: async () => {
      const res = await fetch('/api/beverages');
      if (!res.ok) throw new Error('Failed to fetch beverages');
      return res.json();
    },
  });

  // Find beverage details for each cart item
  const cartItemsWithDetails = cartItems.map(item => {
    const beverage = beverages?.find(b => b.id === item.id);
    return {
      beverageId: item.id,
      quantity: item.quantity,
      beverage,
      subtotal: (beverage?.unitPrice || 0) * item.quantity
    };
  });

  // Calculate order totals
  // Use the subtotal from the cart context if available, otherwise calculate from the cart items
  const subtotal = cartSubtotal || cartItemsWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
  const vatRate = 0.15; // 15% VAT
  const vatAmount = subtotal * vatRate;
  const deliveryFee = 50; // Fixed delivery fee for now
  const total = subtotal + vatAmount + deliveryFee;

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      // Create order payload
      const orderData = {
        deliveryAddress: user?.address || 'Default Address',
        deliveryFee,
        subtotal,
        vatAmount,
        total,
        customerTin: user?.tin,
        deliveryTime,
        status: 'placed',
        items: cartItems.map(item => {
          const beverage = beverages?.find(b => b.id === item.id);
          return {
            beverageId: item.id,
            quantity: item.quantity,
            unitPrice: beverage?.unitPrice || 0,
            subtotal: (beverage?.unitPrice || 0) * item.quantity
          };
        })
      };

      const res = await apiRequest('POST', '/api/orders', orderData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Order Placed',
        description: `Your order #${data.orderNumber} has been placed successfully.`,
      });
      // Clear the cart after successful order
      clearCart();
      navigate('/order/matching');
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to place order',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleIncreaseQuantity = (beverageId: number) => {
    const item = cartItems.find(item => item.id === beverageId);
    if (item) {
      updateQuantity(beverageId, item.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (beverageId: number) => {
    const item = cartItems.find(item => item.id === beverageId);
    if (item && item.quantity > 1) {
      updateQuantity(beverageId, item.quantity - 1);
    }
  };

  const handlePlaceOrder = () => {
    createOrderMutation.mutate();
  };

  const handleGoBack = () => {
    navigate('/');
  };
  
  const handleRemoveItem = (beverageId: number) => {
    removeFromCart(beverageId);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart."
    });
  };

  return (
    <MainLayout title="New Order" showBackButton onBackClick={handleGoBack}>
      <div className="px-4 py-3">
        {/* Selected Products */}
        <div className="mb-5">
          <h3 className="font-heading font-medium text-gray-800 mb-3">Selected Items</h3>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-6">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading items...</p>
              </div>
            ) : (
              cartItemsWithDetails
                .filter(item => item.beverage)
                .map(item => (
                  <OrderItem
                    key={item.beverageId}
                    beverage={item.beverage!}
                    quantity={item.quantity}
                    onIncrement={() => handleIncreaseQuantity(item.beverage!.id)}
                    onDecrement={() => handleDecreaseQuantity(item.beverage!.id)}
                    onRemove={() => handleRemoveItem(item.beverage!.id)}
                  />
                ))
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="mt-3 w-full border-primary text-primary"
            onClick={() => navigate('/')}
          >
            + Add More Items
          </Button>
        </div>
        
        {/* Delivery Details */}
        <div className="mb-5">
          <h3 className="font-heading font-medium text-gray-800 mb-3">Delivery Details</h3>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</Label>
                <div className="flex items-center border border-gray-300 rounded-lg p-2">
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
                    className="text-gray-400 mr-2"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-gray-700">{user?.address || 'Default Address'}</span>
                  <Button variant="link" className="ml-auto text-primary text-sm p-0">Change</Button>
                </div>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</Label>
                <RadioGroup 
                  value={deliveryTime} 
                  onValueChange={(value) => setDeliveryTime(value as any)}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className={`border rounded-lg py-2 text-sm font-medium text-center ${deliveryTime === 'asap' ? 'border-primary bg-primary bg-opacity-10 text-primary' : 'border-gray-300 text-gray-700'}`}>
                    <RadioGroupItem value="asap" id="asap" className="sr-only" />
                    <Label htmlFor="asap" className="w-full cursor-pointer">ASAP</Label>
                  </div>
                  
                  <div className={`border rounded-lg py-2 text-sm font-medium text-center ${deliveryTime === 'today' ? 'border-primary bg-primary bg-opacity-10 text-primary' : 'border-gray-300 text-gray-700'}`}>
                    <RadioGroupItem value="today" id="today" className="sr-only" />
                    <Label htmlFor="today" className="w-full cursor-pointer">Today</Label>
                  </div>
                  
                  <div className={`border rounded-lg py-2 text-sm font-medium text-center ${deliveryTime === 'schedule' ? 'border-primary bg-primary bg-opacity-10 text-primary' : 'border-gray-300 text-gray-700'}`}>
                    <RadioGroupItem value="schedule" id="schedule" className="sr-only" />
                    <Label htmlFor="schedule" className="w-full cursor-pointer">Schedule</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div className="mb-5">
          <h3 className="font-heading font-medium text-gray-800 mb-3">Order Summary</h3>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">{subtotal.toFixed(0)} ETB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (15%)</span>
                  <span className="text-gray-800">{vatAmount.toFixed(0)} ETB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-800">{deliveryFee.toFixed(0)} ETB</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-semibold text-primary">{total.toFixed(0)} ETB</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* TIN Information */}
        <div className="mb-5">
          <Card>
            <CardContent className="p-4">
              <Label className="block text-sm font-medium text-gray-700 mb-1">TIN for VAT Receipt</Label>
              <div className="flex items-center border border-gray-300 rounded-lg p-2">
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
                  className="text-gray-400 mr-2"
                >
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 17.5v-11" />
                </svg>
                <span className="text-gray-700">{user?.tin || 'Not specified'}</span>
                <Button variant="link" className="ml-auto text-primary text-sm p-0">Change</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Place Order Button */}
        <Button 
          className="w-full py-3 text-lg shadow-md"
          onClick={handlePlaceOrder}
          disabled={createOrderMutation.isPending}
        >
          {createOrderMutation.isPending ? 'Processing...' : 'Place Order'}
        </Button>
      </div>
    </MainLayout>
  );
}
