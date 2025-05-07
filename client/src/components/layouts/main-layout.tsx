import { ReactNode } from "react";
import AppHeader from "@/components/ui/app-header";
import BottomNavigation from "@/components/ui/bottom-navigation";

type MainLayoutProps = {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
};

export default function MainLayout({ 
  children, 
  title,
  showBackButton = false,
  onBackClick
}: MainLayoutProps) {
  return (
    <div className="min-h-screen max-w-md mx-auto bg-white relative">
      <AppHeader 
        title={title}
        showBackButton={showBackButton}
        onBackClick={onBackClick}
      />
      
      <main className="pt-16 pb-20 min-h-screen">
        {children}
      </main>
      
      <BottomNavigation />
    </div>
  );
}
