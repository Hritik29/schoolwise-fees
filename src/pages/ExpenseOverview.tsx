import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  List, 
  BarChart3,
  DollarSign,
  TrendingUp,
  Calculator
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

interface ExpenseStats {
  thisMonthExpenses: number;
  avgDailySpend: number;
  netBalance: number;
  lastMonthExpenses: number;
}

export default function ExpenseOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ExpenseStats>({
    thisMonthExpenses: 0,
    avgDailySpend: 0,
    netBalance: 0,
    lastMonthExpenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const expenseOptions = [
    {
      title: "Add Expense",
      description: "Record new expenses and transactions",
      icon: Plus,
      path: "/expenses/add",
      color: "bg-blue-500",
    },
    {
      title: "View Expenses",
      description: "Browse and manage all expense records",
      icon: List,
      path: "/expenses/view",
      color: "bg-green-500",
    },
    {
      title: "Financial Overview",
      description: "Fee vs Expense summary and analytics",
      icon: BarChart3,
      path: "/expenses/overview",
      color: "bg-purple-500",
    },
  ];

  const fetchExpenseStats = async () => {
    try {
      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      const lastMonthStart = startOfMonth(lastMonth);
      const lastMonthEnd = endOfMonth(lastMonth);

      // Fetch this month's expenses
      const { data: thisMonthData, error: thisMonthError } = await supabase
        .from('expenses')
        .select('amount')
        .gte('date', format(thisMonthStart, 'yyyy-MM-dd'))
        .lte('date', format(thisMonthEnd, 'yyyy-MM-dd'));

      if (thisMonthError) throw thisMonthError;

      // Fetch last month's expenses
      const { data: lastMonthData, error: lastMonthError } = await supabase
        .from('expenses')
        .select('amount')
        .gte('date', format(lastMonthStart, 'yyyy-MM-dd'))
        .lte('date', format(lastMonthEnd, 'yyyy-MM-dd'));

      if (lastMonthError) throw lastMonthError;

      // Fetch this month's fees collected
      const { data: feesData, error: feesError } = await supabase
        .from('fee_transactions')
        .select('amount')
        .gte('transaction_date', format(thisMonthStart, 'yyyy-MM-dd'))
        .lte('transaction_date', format(thisMonthEnd, 'yyyy-MM-dd'));

      if (feesError) throw feesError;

      const thisMonthExpenses = thisMonthData?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      const lastMonthExpenses = lastMonthData?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      const thisMonthFees = feesData?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
      
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const avgDailySpend = thisMonthExpenses / daysInMonth;
      const netBalance = thisMonthFees - thisMonthExpenses;

      setStats({
        thisMonthExpenses,
        avgDailySpend,
        netBalance,
        lastMonthExpenses,
      });
    } catch (error) {
      console.error('Error fetching expense stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseStats();
  }, []);

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Expense Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage school expenses, track spending, and monitor financial health
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenseOptions.map((option, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-transparent hover:border-l-primary"
            onClick={() => navigate(option.path)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${option.color} bg-opacity-10`}>
                  <option.icon className={`h-6 w-6 text-${option.color.replace('bg-', '').replace('-500', '')}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {option.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month's Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : formatCurrency(stats.thisMonthExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isLoading && `${calculatePercentageChange(stats.thisMonthExpenses, stats.lastMonthExpenses) >= 0 ? '+' : ''}${calculatePercentageChange(stats.thisMonthExpenses, stats.lastMonthExpenses).toFixed(1)}% from last month`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Daily Spend
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : formatCurrency(stats.avgDailySpend)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Net Balance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {isLoading ? "Loading..." : formatCurrency(stats.netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Fees - Expenses
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}