import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import OrderCreationPage from "@/pages/order-creation-page";
import StockistMatchingPage from "@/pages/stockist-matching-page";
import OrderTrackingPage from "@/pages/order-tracking-page";
import VatReceiptPage from "@/pages/vat-receipt-page";
import StockistDashboardPage from "@/pages/stockist/dashboard-page";
import StockistOrdersPage from "@/pages/stockist/orders-page";
import StockistInventoryPage from "@/pages/stockist/inventory-page";
import StockistEarningsPage from "@/pages/stockist/earnings-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <CartProvider>
          <Switch>
            <Route path="/auth" component={AuthPage} />
            
            {/* Business customer routes */}
            <ProtectedRoute path="/" component={HomePage} />
            <ProtectedRoute path="/order/create" component={OrderCreationPage} />
            <ProtectedRoute path="/order/matching" component={StockistMatchingPage} />
            <ProtectedRoute path="/order/:id" component={OrderTrackingPage} />
            <ProtectedRoute path="/receipt/:orderId" component={VatReceiptPage} />
            
            {/* Stockist routes */}
            <ProtectedRoute path="/stockist/dashboard" component={StockistDashboardPage} />
            <ProtectedRoute path="/stockist/orders" component={StockistOrdersPage} />
            <ProtectedRoute path="/stockist/inventory" component={StockistInventoryPage} />
            <ProtectedRoute path="/stockist/earnings" component={StockistEarningsPage} />
            
            {/* Fallback to 404 */}
            <Route component={NotFound} />
          </Switch>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
