import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layouts/main-layout';
import VatReceipt from '@/components/vat-receipt';

export default function VatReceiptPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch receipt data
  const { data: receiptData, isLoading: isReceiptLoading } = useQuery({
    queryKey: [`/api/receipts/order/${orderId}`],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, we'll use a mock receipt
      return {
        id: 1,
        orderId: parseInt(orderId),
        receiptNumber: 'VAT-23089745',
        sellerName: 'Addis Beverage Wholesalers Ltd',
        sellerTin: '0123456789',
        buyerName: 'Addis Café & Restaurant',
        buyerTin: '1234567890',
        subtotal: 880,
        vatAmount: 132,
        total: 1012,
        receiptData: null,
        issuedAt: new Date().toISOString()
      };
    },
  });

  // Fetch order details
  const { data: orderData, isLoading: isOrderLoading } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, we'll use a mock order
      return {
        id: parseInt(orderId),
        deliveryFee: 50
      };
    },
    enabled: !!receiptData,
  });

  // Fetch order items
  const { data: orderItems, isLoading: isItemsLoading } = useQuery({
    queryKey: [`/api/orders/${orderId}/items`],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, we'll use mock items
      return [
        { 
          id: 1, 
          quantity: 2, 
          subtotal: 530, 
          beverage: { 
            id: 1, 
            name: 'Heineken Beer (Crate)',
            unitPrice: 265
          }
        },
        { 
          id: 2, 
          quantity: 1, 
          subtotal: 350, 
          beverage: { 
            id: 2, 
            name: 'Coca-Cola Crate',
            unitPrice: 350
          }
        }
      ];
    },
    enabled: !!receiptData,
  });

  const isLoading = isReceiptLoading || isOrderLoading || isItemsLoading;

  const handleDownloadReceipt = () => {
    toast({
      title: 'Receipt Downloaded',
      description: 'The VAT receipt has been saved to your device.',
    });
  };

  const handleShareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: `VAT Receipt ${receiptData?.receiptNumber}`,
        text: 'My VAT receipt from DeliverEth',
        url: window.location.href,
      }).catch((error) => {
        toast({
          title: 'Share Failed',
          description: error.message,
          variant: 'destructive',
        });
      });
    } else {
      toast({
        title: 'Share Not Supported',
        description: 'Your device does not support the Web Share API.',
        variant: 'destructive',
      });
    }
  };

  const handleGoBack = () => {
    navigate(`/order/${orderId}`);
  };

  if (isLoading) {
    return (
      <MainLayout title="Loading Receipt..." showBackButton onBackClick={handleGoBack}>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="VAT Receipt" showBackButton onBackClick={handleGoBack}>
      <div className="px-4 py-3">
        {receiptData && (
          <VatReceipt
            receipt={receiptData}
            order={orderData}
            orderItems={orderItems || []}
            onDownload={handleDownloadReceipt}
            onShare={handleShareReceipt}
          />
        )}
      </div>
    </MainLayout>
  );
}
