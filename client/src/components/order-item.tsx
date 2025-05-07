import { useState } from "react";
import { PlusIcon, MinusIcon, Trash2Icon } from "lucide-react";
import { Beverage } from "@shared/schema";

type OrderItemProps = {
  beverage: Beverage;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

export default function OrderItem({ 
  beverage, 
  quantity, 
  onIncrement, 
  onDecrement,
  onRemove
}: OrderItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3">
      <div className="flex justify-between items-start">
        <div className="flex space-x-3">
          {beverage.imageUrl ? (
            <img 
              src={beverage.imageUrl} 
              alt={beverage.name} 
              className="h-16 w-16 rounded-md object-cover"
            />
          ) : (
            <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-800">{beverage.name}</h4>
              <button 
                onClick={onRemove}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                title="Remove item"
              >
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-500 text-sm">{beverage.description}</p>
            <p className="text-primary font-medium">{beverage.unitPrice.toFixed(0)} ETB</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="h-8 w-8 flex items-center justify-center bg-gray-100 rounded-full disabled:opacity-50"
            onClick={onDecrement}
            disabled={quantity <= 1}
          >
            <MinusIcon className="h-4 w-4 text-gray-600" />
          </button>
          <span className="text-gray-800 font-medium w-5 text-center">{quantity}</span>
          <button 
            className="h-8 w-8 flex items-center justify-center bg-primary rounded-full"
            onClick={onIncrement}
          >
            <PlusIcon className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
