import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Search, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import MainLayout from '@/components/layouts/main-layout';
import BeverageCard from '@/components/beverage-card';
import CategorySelector from '@/components/category-selector';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Beverage } from '@shared/schema';

// Categories
const categories = [
  { id: 'all', name: 'All Beverages' },
  { id: 'soft-drinks', name: 'Soft Drinks' },
  { id: 'beer', name: 'Beer' },
  { id: 'water', name: 'Water' },
  { id: 'juice', name: 'Juice' },
  { id: 'spirits', name: 'Spirits' },
];

type SortOption = 'name' | 'price_low' | 'price_high';

export default function HomePage() {
  const { user } = useAuth();
  const { cartItems, addToCart, totalItems, subtotal } = useCart();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Fetch beverages
  const { data: beverages, isLoading } = useQuery<Beverage[]>({
    queryKey: ['/api/beverages', selectedCategory],
    queryFn: async ({ queryKey }) => {
      const [_, category] = queryKey;
      const res = await fetch(`/api/beverages?category=${category}`);
      if (!res.ok) throw new Error('Failed to fetch beverages');
      return res.json();
    },
  });

  // Filter beverages by search query and sort
  const filteredAndSortedBeverages = beverages
    ?.filter(beverage => 
      beverage.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    ?.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price_low') {
        return a.unitPrice - b.unitPrice;
      } else {
        return b.unitPrice - a.unitPrice;
      }
    });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleBeverageSelect = (beverage: Beverage) => {
    // Add to cart using the context
    addToCart(beverage);
  };

  const handleCheckout = () => {
    navigate('/order/create');
  };

  return (
    <MainLayout>
      <div className="px-4 py-3">
        {/* Business Profile Summary */}
        <Card className="bg-primary bg-opacity-10 mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-heading font-medium text-primary">
                  {user?.businessName || user?.name}
                </h2>
                {user?.tin && (
                  <p className="text-xs text-gray-600">TIN: {user.tin}</p>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-primary border-primary"
              >
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Search Bar */}
        <div className="relative mb-5">
          <Input
            type="text"
            placeholder="Search beverages..."
            className="pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
        
        {/* Categories Selector */}
        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
        
        {/* Sort Options */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Sort by:</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setSortBy('name')}
              className={`px-3 py-1 text-xs rounded-full ${sortBy === 'name' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700'}`}
            >
              Name
            </button>
            <button 
              onClick={() => setSortBy('price_low')}
              className={`px-3 py-1 text-xs rounded-full ${sortBy === 'price_low' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700'}`}
            >
              Price: Low to High
            </button>
            <button 
              onClick={() => setSortBy('price_high')}
              className={`px-3 py-1 text-xs rounded-full ${sortBy === 'price_high' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700'}`}
            >
              Price: High to Low
            </button>
          </div>
        </div>
        
        {/* Beverages Grid */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading beverages...</p>
          </div>
        ) : filteredAndSortedBeverages?.length ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredAndSortedBeverages.map((beverage: Beverage) => (
              <BeverageCard
                key={beverage.id}
                beverage={beverage}
                onClick={handleBeverageSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">No beverages found</p>
          </div>
        )}
        
        {/* Cart Preview */}
        {totalItems > 0 && (
          <div className="fixed bottom-20 inset-x-0 px-4">
            <Card className="w-full shadow-lg border-primary border">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="h-4 w-4" />
                        {totalItems} item(s) selected
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">Subtotal: <span className="text-primary font-medium">{subtotal.toFixed(0)} ETB</span></p>
                  </div>
                  <Button 
                    onClick={handleCheckout}
                    className="text-sm px-5"
                  >
                    Checkout 
                    <span className="ml-1">→</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
