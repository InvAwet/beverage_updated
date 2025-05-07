import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layouts/main-layout';
import StockistCard from '@/components/stockist-card';

type Stockist = {
  id: number;
  name: string;
  businessName: string;
  isVatRegistered: boolean;
  address: string;
  distance: number;
  rating: string;
  deliveryFee: number;
  estimatedTime: string;
};

export default function StockistMatchingPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedStockistId, setSelectedStockistId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch nearby stockists
  const { data: stockists } = useQuery<Stockist[]>({
    queryKey: ['/api/stockists/nearby'],
    queryFn: async () => {
      const res = await fetch('/api/stockists/nearby');
      if (!res.ok) throw new Error('Failed to fetch nearby stockists');
      return res.json();
    },
  });

  // Simulate loading time for stockist matching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleStockistSelection = (stockistId: number) => {
    setSelectedStockistId(stockistId);
  };

  const handleConfirmStockist = () => {
    if (!selectedStockistId) {
      toast({
        title: 'No stockist selected',
        description: 'Please select a stockist to proceed.',
        variant: 'destructive',
      });
      return;
    }

    // In a real application, you would update the order with the selected stockist
    // For now, we'll just navigate to the order tracking page with a mock order ID
    navigate('/order/123');
  };

  const handleGoBack = () => {
    navigate('/order/create');
  };

  // Sort stockists by distance
  const sortedStockists = stockists?.sort((a, b) => a.distance - b.distance) || [];

  // Determine fastest and cheapest stockists
  const fastestStockist = sortedStockists[0];
  const cheapestStockist = sortedStockists.length > 0 
    ? sortedStockists.reduce((prev, current) => 
        prev.deliveryFee < current.deliveryFee ? prev : current
      )
    : undefined;

  return (
    <MainLayout title="Finding Stockists" showBackButton onBackClick={handleGoBack}>
      <div className="px-4 py-3">
        {isLoading ? (
          <div className="my-8 flex flex-col items-center justify-center">
            <div className="relative h-24 w-24 mb-4">
              <Loader2 className="animate-spin h-24 w-24 text-primary" />
            </div>
            <h3 className="font-heading font-medium text-gray-800 text-center">
              Finding the best stockists nearby...
            </h3>
            <p className="text-gray-600 text-center mt-2">
              This usually takes less than a minute
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <h3 className="font-heading font-medium text-gray-800 mb-3">
                Available Stockists
              </h3>
              
              {sortedStockists.length > 0 ? (
                <div className="space-y-3">
                  {sortedStockists.map((stockist) => (
                    <StockistCard
                      key={stockist.id}
                      stockist={stockist}
                      isFastest={stockist.id === fastestStockist?.id}
                      isCheapest={stockist.id === cheapestStockist?.id}
                      onSelect={handleStockistSelection}
                      selected={selectedStockistId === stockist.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-600">No stockists available at the moment</p>
                </div>
              )}
            </div>
            
            {selectedStockistId && (
              <button
                className="w-full bg-primary text-white py-3 rounded-lg font-medium shadow-md"
                onClick={handleConfirmStockist}
              >
                Confirm Selection
              </button>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
