import { CheckCircleIcon, CircleIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatusStepProps = {
  title: string;
  timestamp: string | null;
  status: "completed" | "current" | "upcoming";
  isLast?: boolean;
};

function OrderStatusStep({ title, timestamp, status, isLast = false }: OrderStatusStepProps) {
  return (
    <div className="relative flex items-start mb-4">
      {/* Status Icon */}
      <div className={cn(
        "h-5 w-5 rounded-full flex-shrink-0 z-10 flex items-center justify-center",
        status === "completed" ? "bg-green-500" : 
        status === "current" ? "bg-blue-500" : "bg-gray-300"
      )}>
        {status === "completed" && <CheckCircleIcon className="h-5 w-5 text-white" />}
        {status === "current" && <Loader2Icon className="h-3 w-3 text-white animate-spin" />}
      </div>
      
      {/* Content */}
      <div className="ml-4">
        <p className={cn(
          "font-medium",
          status === "completed" ? "text-gray-800" : 
          status === "current" ? "text-gray-800" : "text-gray-500"
        )}>
          {title}
        </p>
        <p className="text-xs text-gray-500">
          {timestamp || (status === "upcoming" ? "Upcoming" : "In progress")}
        </p>
      </div>
      
      {/* Connecting Line */}
      {!isLast && (
        <div className={cn(
          "absolute left-2.5 top-0 h-full w-0.5",
          status === "completed" ? "bg-green-500" : "bg-gray-200"
        )} />
      )}
    </div>
  );
}

type OrderStatusProps = {
  currentStatus: string;
  orderPlacedAt: string;
  stockistAssignedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  estimatedDeliveryTime?: string;
};

export default function OrderStatus({
  currentStatus,
  orderPlacedAt,
  stockistAssignedAt,
  outForDeliveryAt,
  deliveredAt,
  estimatedDeliveryTime
}: OrderStatusProps) {
  // Format timestamps if provided
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return null;
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      return timestamp; // Return as is if parsing fails
    }
  };
  
  const orderPlacedFormatted = formatTimestamp(orderPlacedAt);
  const stockistAssignedFormatted = formatTimestamp(stockistAssignedAt);
  const outForDeliveryFormatted = formatTimestamp(outForDeliveryAt);
  const deliveredFormatted = formatTimestamp(deliveredAt);

  // Determine status for each step
  const getStepStatus = (step: string): "completed" | "current" | "upcoming" => {
    const statusOrder = ["placed", "matched", "delivering", "delivered"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-medium text-gray-800">Status</h3>
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          currentStatus === "delivered" 
            ? "bg-green-100 text-green-800" 
            : "bg-blue-100 text-blue-800"
        )}>
          {currentStatus === "placed" && "Order Placed"}
          {currentStatus === "matched" && "Stockist Assigned"}
          {currentStatus === "delivering" && "On the way"}
          {currentStatus === "delivered" && "Delivered"}
        </span>
      </div>
      
      {/* Status Timeline */}
      <div className="relative pb-2">
        <OrderStatusStep 
          title="Order Placed" 
          timestamp={orderPlacedFormatted} 
          status={getStepStatus("placed")} 
        />
        
        <OrderStatusStep 
          title="Stockist Assigned" 
          timestamp={stockistAssignedFormatted} 
          status={getStepStatus("matched")} 
        />
        
        <OrderStatusStep 
          title="Out for Delivery" 
          timestamp={outForDeliveryFormatted} 
          status={getStepStatus("delivering")} 
        />
        
        <OrderStatusStep 
          title="Delivered" 
          timestamp={deliveredFormatted || `Estimated: ${estimatedDeliveryTime}`} 
          status={getStepStatus("delivered")}
          isLast
        />
      </div>
    </div>
  );
}
