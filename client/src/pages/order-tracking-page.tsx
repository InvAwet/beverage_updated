import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { PhoneIcon, MessageSquareIcon } from 'lucide-react';
import MainLayout from '@/components/layouts/main-layout';
import OrderStatus from '@/components/order-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Mock order data for initial implementation
const mockOrderData = {
  id: 123,
  orderNumber: 'ET78945',
  status: 'delivering',
  createdAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago
  stockistAssignedAt: new Date(Date.now() - 42 * 60000).toISOString(), // 42 mins ago
  outForDeliveryAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
  estimatedDeliveryTime: '10:45 AM',
  stockist: {
    id: 1,
    name: "Abebe's Store",
    rating: 4.8,
    phone: '+251912345678',
    isVatRegistered: false
  },
  orderItems: [
    { id: 1, quantity: 2, name: 'Heineken Beer (Crate)', price: 265, subtotal: 530 },
    { id: 2, quantity: 1, name: 'Coca-Cola Crate', price: 350, subtotal: 350 }
  ],
  subtotal: 880,
  vatAmount: 132,
  deliveryFee: 50,
  total: 1062
};

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [receiptStatus, setReceiptStatus] = useState<'pending' | 'available'>('pending');

  // Fetch order details
  const { data: orderData, isLoading } = useQuery({
    queryKey: [`/api/orders/${id}`],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, we'll use the mock data
      return mockOrderData;
    },
  });

  // Simulate receipt becoming available after a delay
  useEffect(() => {
    if (orderData?.status === 'delivered') {
      const timer = setTimeout(() => {
        setReceiptStatus('available');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [orderData]);

  const handleCallStockist = () => {
    if (orderData?.stockist?.phone) {
      window.location.href = `tel:${orderData.stockist.phone}`;
    } else {
      toast({
        title: 'Cannot make call',
        description: 'Stockist phone number is not available',
        variant: 'destructive',
      });
    }
  };

  const handleMessageStockist = () => {
    if (orderData?.stockist?.phone) {
      window.location.href = `sms:${orderData.stockist.phone}`;
    } else {
      toast({
        title: 'Cannot send message',
        description: 'Stockist phone number is not available',
        variant: 'destructive',
      });
    }
  };

  const handleViewReceipt = () => {
    if (receiptStatus === 'available') {
      navigate(`/receipt/${orderData?.id}`);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <MainLayout title="Loading..." showBackButton onBackClick={handleGoBack}>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Order #${orderData?.orderNumber}`} showBackButton onBackClick={handleGoBack}>
      <div className="px-4 py-3">
        {/* Order Status Card */}
        <OrderStatus
          currentStatus={orderData?.status || 'placed'}
          orderPlacedAt={orderData?.createdAt || ''}
          stockistAssignedAt={orderData?.stockistAssignedAt}
          outForDeliveryAt={orderData?.outForDeliveryAt}
          estimatedDeliveryTime={orderData?.estimatedDeliveryTime}
        />
        
        {/* Stockist Information */}
        <Card className="mb-5">
          <CardContent className="p-4">
            <h3 className="font-heading font-medium text-gray-800 mb-3">Stockist Information</h3>
            
            <div className="flex items-center">
              <div className="h-12 w-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-3">
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
                  className="text-primary"
                >
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                  <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                  <path d="M21 9V3" />
                  <path d="M3 9V3" />
                  <path d="M12 14v3" />
                  <path d="M8 14v1" />
                  <path d="M16 14v1" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{orderData?.stockist?.name}</h4>
                <div className="flex items-center text-sm text-gray-600">
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
                    className="text-amber-400 mr-1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>{orderData?.stockist?.rating}</span>
                  <span className="mx-1">•</span>
                  <span>TIN: {orderData?.stockist?.isVatRegistered ? 'VAT registered' : 'Non-VAT registered'}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button 
                variant="secondary" 
                className="flex items-center justify-center" 
                onClick={handleCallStockist}
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button 
                className="flex items-center justify-center" 
                onClick={handleMessageStockist}
              >
                <MessageSquareIcon className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Order Details */}
        <Card className="mb-5">
          <CardContent className="p-4">
            <h3 className="font-heading font-medium text-gray-800 mb-3">Order Details</h3>
            
            <div className="mb-4">
              {orderData?.orderItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <span className="text-gray-700 w-8">{item.quantity}×</span>
                    <span className="text-gray-800">{item.name}</span>
                  </div>
                  <span className="text-gray-800">{item.subtotal} ETB</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-3" />
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">{orderData?.subtotal} ETB</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">VAT (15%)</span>
                <span className="text-gray-800">{orderData?.vatAmount} ETB</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="text-gray-800">{orderData?.deliveryFee} ETB</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="text-primary">{orderData?.total} ETB</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* VAT Receipt Status */}
        <Card className="mb-5">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-medium text-gray-800">VAT Receipt</h3>
              <Badge 
                variant="outline" 
                className={
                  receiptStatus === 'available' ? 
                  "bg-green-100 text-green-800 hover:bg-green-100" : 
                  "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                }
              >
                {receiptStatus === 'available' ? 'Available' : 'Pending'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {receiptStatus === 'available' 
                ? "Your VAT receipt is now available. Click below to view it." 
                : "Your VAT receipt will be issued once the delivery is complete and verified."}
            </p>
            
            {receiptStatus === 'available' && (
              <Button 
                className="w-full mt-3" 
                onClick={handleViewReceipt}
              >
                View Receipt
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
