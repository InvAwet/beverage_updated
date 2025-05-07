import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock data for charts
const weeklyEarnings = [
  { day: 'Mon', amount: 450 },
  { day: 'Tue', amount: 300 },
  { day: 'Wed', amount: 550 },
  { day: 'Thu', amount: 400 },
  { day: 'Fri', amount: 650 },
  { day: 'Sat', amount: 800 },
  { day: 'Sun', amount: 300 },
];

const monthlyEarnings = [
  { month: 'Jan', amount: 3500 },
  { month: 'Feb', amount: 4200 },
  { month: 'Mar', amount: 3800 },
  { month: 'Apr', amount: 5000 },
  { month: 'May', amount: 4600 },
  { month: 'Jun', amount: 6000 },
];

const categoryBreakdown = [
  { name: 'Beer', value: 60 },
  { name: 'Soft Drinks', value: 25 },
  { name: 'Water', value: 10 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#5E2D8C', '#119DA4', '#FFC107', '#DC3545'];

export default function StockistEarningsPage() {
  const [period, setPeriod] = useState('week');
  
  // Fetch earnings transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/stockists/earnings'],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, we'll use mock transactions
      return [
        {
          id: 1,
          orderNumber: 'ET78945',
          customerName: 'Addis Café & Restaurant',
          amount: 150,
          date: '2023-08-28T10:30:00Z',
          status: 'paid',
          type: 'delivery'
        },
        {
          id: 2,
          orderNumber: 'ET78932',
          customerName: 'Bole Restaurant',
          amount: 220,
          date: '2023-08-27T14:15:00Z',
          status: 'paid',
          type: 'delivery'
        },
        {
          id: 3,
          orderNumber: 'ET78901',
          customerName: 'Merkato Café',
          amount: 180,
          date: '2023-08-26T09:45:00Z',
          status: 'paid',
          type: 'delivery'
        },
        {
          id: 4,
          orderNumber: 'ET78890',
          customerName: 'Piazza Restaurant',
          amount: 130,
          date: '2023-08-25T16:20:00Z',
          status: 'paid',
          type: 'delivery'
        },
        {
          id: 5,
          orderNumber: null,
          customerName: null,
          amount: 500,
          date: '2023-08-24T11:30:00Z',
          status: 'paid',
          type: 'bonus'
        }
      ];
    },
  });

  // Calculate totals
  const totalEarnings = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const deliveryEarnings = transactions?.filter(tx => tx.type === 'delivery').reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const bonusEarnings = transactions?.filter(tx => tx.type === 'bonus').reduce((sum, tx) => sum + tx.amount, 0) || 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <MainLayout title="Earnings">
      <div className="px-4 py-3">
        {/* Earnings Summary */}
        <Card className="mb-5">
          <CardContent className="p-4">
            <h2 className="font-heading font-medium text-gray-800 mb-4">Earnings Summary</h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2">
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold text-xl text-secondary">{totalEarnings} ETB</p>
              </div>
              <div className="p-2">
                <p className="text-sm text-gray-600">Deliveries</p>
                <p className="font-semibold text-xl text-gray-800">{deliveryEarnings} ETB</p>
              </div>
              <div className="p-2">
                <p className="text-sm text-gray-600">Bonuses</p>
                <p className="font-semibold text-xl text-gray-800">{bonusEarnings} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Earnings Charts */}
        <Card className="mb-5">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-medium text-gray-800">Earnings Trend</h3>
              <div className="flex space-x-2">
                <button 
                  className={`text-xs px-2 py-1 rounded-full ${period === 'week' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => setPeriod('week')}
                >
                  Week
                </button>
                <button 
                  className={`text-xs px-2 py-1 rounded-full ${period === 'month' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => setPeriod('month')}
                >
                  Month
                </button>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={period === 'week' ? weeklyEarnings : monthlyEarnings}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey={period === 'week' ? 'day' : 'month'} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value} ETB`}
                  />
                  <Tooltip formatter={(value) => [`${value} ETB`, 'Earnings']} />
                  <Bar 
                    dataKey="amount" 
                    fill="#119DA4" 
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Category Breakdown */}
        <Card className="mb-5">
          <CardContent className="p-4">
            <h3 className="font-heading font-medium text-gray-800 mb-4">Category Breakdown</h3>
            <div className="flex">
              <div className="w-1/2 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col justify-center">
                {categoryBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm text-gray-700">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Transaction History */}
        <div className="mb-4">
          <h3 className="font-heading font-medium text-gray-800 mb-3">Transaction History</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-4 border-secondary border-t-transparent rounded-full"></div>
            </div>
          ) : transactions?.length ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <Card key={tx.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {tx.type === 'delivery' 
                            ? `Order #${tx.orderNumber}` 
                            : 'Performance Bonus'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {tx.type === 'delivery' 
                            ? tx.customerName 
                            : 'Weekly top performer bonus'} • {formatDate(tx.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+{tx.amount} ETB</p>
                        <Badge 
                          variant="outline" 
                          className={tx.type === 'bonus' 
                            ? "bg-purple-100 text-purple-800 hover:bg-purple-100" 
                            : "bg-green-100 text-green-800 hover:bg-green-100"
                          }
                        >
                          {tx.type === 'bonus' ? 'Bonus' : 'Delivery'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-600">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
