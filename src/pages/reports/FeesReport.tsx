import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Users, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function FeesReport() {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");

  // Real-time fee data fetching
  const { data: feesData, isLoading, refetch } = useQuery({
    queryKey: ['fees-report', selectedMonth, selectedClass],
    queryFn: async () => {
      let query = supabase
        .from('fee_transactions')
        .select(`
          *,
          students (
            first_name,
            last_name,
            class_grade,
            section
          )
        `);

      if (selectedClass !== "all") {
        query = query.eq('students.class_grade', selectedClass);
      }

      if (selectedMonth !== "all") {
        const year = new Date().getFullYear();
        const month = selectedMonth.padStart(2, '0');
        query = query.gte('transaction_date', `${year}-${month}-01`)
                   .lt('transaction_date', `${year}-${month === '12' ? year + 1 : year}-${month === '12' ? '01' : (parseInt(month) + 1).toString().padStart(2, '0')}-01`);
      }

      const { data, error } = await query.order('transaction_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds for real-time data
  });

  // Sample data for charts (you can replace with actual calculations from feesData)
  const monthlyCollectionData = [
    { month: 'Jan', collected: 125000, target: 150000 },
    { month: 'Feb', collected: 142000, target: 150000 },
    { month: 'Mar', collected: 138000, target: 150000 },
    { month: 'Apr', collected: 156000, target: 150000 },
    { month: 'May', collected: 149000, target: 150000 },
    { month: 'Jun', collected: 163000, target: 150000 },
  ];

  const feeTypeDistribution = [
    { name: 'Tuition Fee', value: 65, color: '#8884d8' },
    { name: 'Transport Fee', value: 20, color: '#82ca9d' },
    { name: 'Admission Fee', value: 10, color: '#ffc658' },
    { name: 'Other Fees', value: 5, color: '#ff7300' },
  ];

  const classWiseCollection = [
    { class: 'Nur.', collected: 45000, pending: 15000 },
    { class: 'L.K.G.', collected: 52000, pending: 18000 },
    { class: 'U.K.G.', collected: 48000, pending: 12000 },
    { class: '1st', collected: 65000, pending: 25000 },
    { class: '2nd', collected: 58000, pending: 22000 },
    { class: '3rd', collected: 72000, pending: 28000 },
  ];

  const totalCollected = feesData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
  const totalTransactions = feesData?.length || 0;
  const avgTransactionAmount = totalTransactions > 0 ? totalCollected / totalTransactions : 0;

  const handleExport = () => {
    // Export logic would go here
    console.log("Exporting fees report...");
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fees Report</h1>
          <p className="text-muted-foreground">Real-time financial analytics and fee collection insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="Nur.">Nursery</SelectItem>
                  <SelectItem value="L.K.G.">L.K.G.</SelectItem>
                  <SelectItem value="U.K.G.">U.K.G.</SelectItem>
                  <SelectItem value="1st">1st</SelectItem>
                  <SelectItem value="2nd">2nd</SelectItem>
                  <SelectItem value="3rd">3rd</SelectItem>
                  <SelectItem value="4th">4th</SelectItem>
                  <SelectItem value="5th">5th</SelectItem>
                  <SelectItem value="6th">6th</SelectItem>
                  <SelectItem value="7th">7th</SelectItem>
                  <SelectItem value="8th">8th</SelectItem>
                  <SelectItem value="9th">9th</SelectItem>
                  <SelectItem value="10th">10th</SelectItem>
                  <SelectItem value="11th">11th</SelectItem>
                  <SelectItem value="12th">12th</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Input
                id="dateRange"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">₹{totalCollected.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm text-blue-500">+8.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Transaction</p>
                <p className="text-2xl font-bold">₹{Math.round(avgTransactionAmount).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-sm text-red-500">-2.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold text-green-600">85.2%</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+3.8% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Collection Trend</CardTitle>
            <CardDescription>Collection vs Target comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyCollectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="collected" fill="#8884d8" name="Collected" />
                <Bar dataKey="target" fill="#82ca9d" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Type Distribution</CardTitle>
            <CardDescription>Breakdown by fee categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feeTypeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {feeTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Class-wise Collection */}
      <Card>
        <CardHeader>
          <CardTitle>Class-wise Fee Collection</CardTitle>
          <CardDescription>Collection status across different classes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classWiseCollection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="collected" fill="#22c55e" name="Collected" />
              <Bar dataKey="pending" fill="#ef4444" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest fee payments ({isLoading ? 'Loading...' : totalTransactions} transactions)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            ) : feesData && feesData.length > 0 ? (
              feesData.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium">₹{transaction.amount.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.applied_to_fee_type?.replace('_', ' ') || 'General'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.payment_method.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {transaction.students ? 
                        `${transaction.students.first_name} ${transaction.students.last_name} (${transaction.students.class_grade}-${transaction.students.section})` 
                        : 'Unknown Student'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found for selected filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}