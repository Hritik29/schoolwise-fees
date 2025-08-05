import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, isToday } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinancialData {
  totalFeesCollected: number;
  totalExpenses: number;
  todayFees: number;
  todayExpenses: number;
  netBalance: number;
}

export default function FinancialOverview() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalFeesCollected: 0,
    totalExpenses: 0,
    todayFees: 0,
    todayExpenses: 0,
    netBalance: 0,
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchFinancialData = async () => {
    try {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      const monthStart = startOfMonth(new Date(year, month));
      const monthEnd = endOfMonth(new Date(year, month));
      const today = new Date().toISOString().split('T')[0];

      // Fetch total fees collected (from fee_transactions table)
      const { data: feesData, error: feesError } = await supabase
        .from('fee_transactions')
        .select('amount, transaction_date')
        .gte('transaction_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('transaction_date', format(monthEnd, 'yyyy-MM-dd'));

      if (feesError) throw feesError;

      // Fetch total expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, date')
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'));

      if (expensesError) throw expensesError;

      // Calculate totals
      const totalFeesCollected = feesData?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
      const totalExpenses = expensesData?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

      // Calculate today's data
      const todayFees = feesData?.filter(fee => fee.transaction_date === today)
        .reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
      const todayExpenses = expensesData?.filter(expense => expense.date === today)
        .reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

      const netBalance = totalFeesCollected - totalExpenses;

      setFinancialData({
        totalFeesCollected,
        totalExpenses,
        todayFees,
        todayExpenses,
        netBalance,
      });

      // Prepare chart data
      const chartData = [
        {
          name: 'Fees Collected',
          amount: totalFeesCollected,
          fill: '#10b981'
        },
        {
          name: 'Total Expenses',
          amount: totalExpenses,
          fill: '#ef4444'
        }
      ];

      setChartData(chartData);

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Error",
        description: "Failed to load financial data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [selectedMonth, selectedYear]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/expense-overview')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Financial Overview</h1>
          <p className="text-muted-foreground mt-2">
            Fee vs Expense Summary and Analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {format(new Date(2024, i, 1), 'MMMM')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading financial data...</div>
      ) : (
        <>
          {/* Today's Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Fees Collected
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialData.todayFees)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Income received today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Expenses
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(financialData.todayExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Amount spent today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Fees Collected
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialData.totalFeesCollected)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month's income
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(financialData.totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month's spending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Balance
                </CardTitle>
                <Calculator className={`h-4 w-4 ${financialData.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${financialData.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialData.netBalance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Fees - Expenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Fees vs Expenses Comparison</CardTitle>
              <CardDescription>
                Visual representation of income vs expenses for {format(new Date(parseInt(selectedYear), parseInt(selectedMonth), 1), 'MMMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Health Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.netBalance >= 0 ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800">Positive Cash Flow</h4>
                    <p className="text-green-700">
                      The school has a positive net balance of {formatCurrency(financialData.netBalance)} this month. 
                      This indicates healthy financial management.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800">Negative Cash Flow</h4>
                    <p className="text-red-700">
                      The school has a negative net balance of {formatCurrency(Math.abs(financialData.netBalance))} this month. 
                      Consider reviewing expenses or increasing fee collection.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div>
                    <h5 className="font-medium mb-2">Fee Collection Rate</h5>
                    <p className="text-sm text-muted-foreground">
                      {financialData.totalFeesCollected > 0 ? 'Active collection in progress' : 'No fees collected this month'}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Expense Management</h5>
                    <p className="text-sm text-muted-foreground">
                      {financialData.totalExpenses > 0 ? 'Active spending recorded' : 'No expenses recorded this month'}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Financial Health</h5>
                    <p className="text-sm text-muted-foreground">
                      {((financialData.totalFeesCollected / (financialData.totalFeesCollected + financialData.totalExpenses)) * 100 || 0).toFixed(1)}% fee collection efficiency
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}