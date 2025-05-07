import { useState } from "react";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
};

type CategorySelectorProps = {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
};

export default function CategorySelector({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) {
  return (
    <div className="mb-5 overflow-x-auto hide-scrollbar">
      <div className="flex space-x-3 py-2 w-max">
        {categories.map((category) => (
          <button
            key={category.id}
            className={cn(
              "px-4 py-2 rounded-full shadow-sm text-sm font-medium whitespace-nowrap",
              selectedCategory === category.id
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
