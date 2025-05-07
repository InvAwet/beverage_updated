import { Home, ListChecks, Receipt, User, Boxes, Wallet, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { totalItems } = useCart();
  
  // Determine if we're in stockist mode
  const isStockist = user?.userType === "stockist";
  
  const navItems = isStockist
    ? [
        { path: "/stockist/dashboard", label: "Dashboard", icon: Home },
        { path: "/stockist/orders", label: "Orders", icon: ListChecks },
        { path: "/stockist/inventory", label: "Inventory", icon: Boxes },
        { path: "/stockist/earnings", label: "Earnings", icon: Wallet },
      ]
    : [
        { path: "/", label: "Home", icon: Home },
        { path: "/order/create", label: "Cart", icon: ShoppingCart, badge: totalItems > 0 ? totalItems : null },
        { path: "/orders", label: "Orders", icon: ListChecks },
        { path: "/receipts", label: "Receipts", icon: Receipt },
        { path: "/account", label: "Account", icon: User },
      ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 py-2 px-6">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = item.path === location || 
            (item.path !== "/" && location.startsWith(item.path));
            
          const IconComponent = item.icon;
          const badgeCount = item.badge as number | null;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className="flex flex-col items-center px-4 cursor-pointer">
                <div className="relative">
                  <IconComponent 
                    className={cn(
                      "h-5 w-5",
                      isActive ? (isStockist ? "text-secondary" : "text-primary") : "text-gray-500"
                    )} 
                  />
                  {badgeCount && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[10px]"
                      variant="default"
                    >
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </Badge>
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs mt-1",
                    isActive ? (isStockist ? "text-secondary" : "text-primary") : "text-gray-500"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
