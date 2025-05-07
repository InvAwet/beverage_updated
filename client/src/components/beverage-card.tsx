import { Beverage } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type BeverageCardProps = {
  beverage: Beverage;
  onClick: (beverage: Beverage) => void;
};

export default function BeverageCard({ beverage, onClick }: BeverageCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(beverage)}
    >
      <div className="h-28 w-full bg-gray-100">
        {beverage.imageUrl && (
          <img 
            src={beverage.imageUrl} 
            alt={beverage.name} 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <CardContent className="p-3">
        <h4 className="font-medium text-gray-800">{beverage.name}</h4>
        <div className="flex justify-between items-center mt-1">
          <p className="text-primary font-semibold">{beverage.unitPrice.toFixed(0)} ETB</p>
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            In Stock
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
