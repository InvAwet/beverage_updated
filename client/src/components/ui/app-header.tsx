import { useAuth } from "@/hooks/use-auth";
import { BellIcon, UserCircle, ChevronLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import IconButton from "./icon-button";

type AppHeaderProps = {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
};

export default function AppHeader({ 
  title, 
  showBackButton = false, 
  onBackClick 
}: AppHeaderProps) {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate("/");
    }
  };
  
  // Different header style for stockist app
  const isStockistApp = user?.userType === "stockist" && location.startsWith("/stockist");
  
  return (
    <header className={`px-4 py-3 shadow-sm fixed top-0 w-full max-w-md z-10 ${isStockistApp ? 'bg-secondary' : 'bg-white'}`}>
      <div className="flex justify-between items-center">
        {showBackButton ? (
          <div className="flex items-center">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className={isStockistApp ? "text-white hover:bg-secondary-light" : ""}
            >
              <ChevronLeft className="h-5 w-5" />
            </IconButton>
            
            {title && (
              <h1 className={`font-heading font-medium text-lg ml-2 ${isStockistApp ? 'text-white' : 'text-gray-800'}`}>
                {title}
              </h1>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <Link href={user?.userType === "stockist" ? "/stockist/dashboard" : "/"}>
              <div className="flex items-center cursor-pointer">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  DE
                </div>
                <h1 className={`font-heading font-semibold text-xl ml-2 ${isStockistApp ? 'text-white' : 'text-primary'}`}>
                  {isStockistApp ? 'DeliverEth Stockist' : 'DeliverEth'}
                </h1>
              </div>
            </Link>
          </div>
        )}
        
        <div className="flex items-center space-x-3">
          <IconButton
            variant="ghost"
            size="sm"
            className={isStockistApp ? "text-white hover:bg-secondary-light" : ""}
          >
            <BellIcon className="h-5 w-5" />
          </IconButton>
          
          {isStockistApp ? (
            <div className="h-10 w-10 bg-white text-secondary rounded-full flex items-center justify-center">
              <span className="font-medium">{user?.name.substring(0, 2).toUpperCase()}</span>
            </div>
          ) : (
            <IconButton
              variant="ghost"
              size="sm"
            >
              <UserCircle className="h-6 w-6 text-gray-600" />
            </IconButton>
          )}
        </div>
      </div>
    </header>
  );
}
