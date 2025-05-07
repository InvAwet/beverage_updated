import { StarIcon, MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

type StockistCardProps = {
  stockist: Stockist;
  isFastest?: boolean;
  isCheapest?: boolean;
  onSelect: (stockistId: number) => void;
  selected?: boolean;
};

export default function StockistCard({
  stockist,
  isFastest = false,
  isCheapest = false,
  onSelect,
  selected = false,
}: StockistCardProps) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex space-x-3">
            <div className="h-12 w-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
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
              <h4 className="font-medium text-gray-800">{stockist.businessName || stockist.name}</h4>
              <div className="flex items-center text-sm text-gray-600">
                <StarIcon className="h-3 w-3 text-amber-400 mr-1" />
                <span>{stockist.rating}</span>
                <span className="mx-1">•</span>
                <span>{stockist.distance.toFixed(1)} km away</span>
              </div>
            </div>
          </div>
          {isFastest && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Fastest</Badge>
          )}
          {isCheapest && (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Cheapest</Badge>
          )}
        </div>
        
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Delivery Fee</p>
            <p className="font-medium text-gray-800">{stockist.deliveryFee} ETB</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estimated Time</p>
            <p className="font-medium text-gray-800">{stockist.estimatedTime}</p>
          </div>
          <Button 
            onClick={() => onSelect(stockist.id)}
            variant={selected ? "default" : "outline"}
            className={selected ? "bg-primary text-white" : "border-primary text-primary hover:bg-primary/10"}
          >
            {selected ? "Selected" : "Select"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
