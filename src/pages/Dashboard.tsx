import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, AlertTriangle, TrendingUp, GraduationCap, CreditCard, Eye, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const [studentsResult, feesResult, transactionsResult, expensesResult, todaysTransactionsResult] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact' }),
        supabase.from('student_fees').select('total_amount, paid_amount, outstanding_amount'),
        supabase.from('fee_transactions').select('amount, transaction_date'),
        supabase.from('expenses').select('amount, date'),
        supabase.from('fee_transactions').select('amount').eq('transaction_date', today)
      ]);

      const totalStudents = studentsResult.count || 0;
      const feesData = feesResult.data || [];
      
      const totalFees = feesData.reduce((sum, fee) => sum + Number(fee.total_amount), 0);
      const totalCollected = feesData.reduce((sum, fee) => sum + Number(fee.paid_amount), 0);
      const totalOutstanding = feesData.reduce((sum, fee) => sum + Number(fee.outstanding_amount), 0);
      
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      
      const monthlyCollection = (transactionsResult.data || [])
        .filter(t => {
          const date = new Date(t.transaction_date);
          return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Calculate today's collection and total expenses
      const todaysCollection = (todaysTransactionsResult.data || []).reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpense = (expensesResult.data || []).reduce((sum, exp) => sum + Number(exp.amount), 0);
      const todaysExpense = (expensesResult.data || [])
        .filter(exp => exp.date === today)
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      return {
        totalStudents,
        totalFees,
        totalCollected,
        totalOutstanding,
        monthlyCollection,
        totalExpense,
        todaysExpense,
        todaysCollection
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds for real-time data
  });

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      description: "Active enrolled students",
      color: "text-primary"
    },
    {
      title: "Total Fees",
      value: `₹${(stats?.totalFees || 0).toLocaleString()}`,
      icon: DollarSign,
      description: "Total fees assigned",
      color: "text-accent"
    },
    {
      title: "Collected",
      value: `₹${(stats?.totalCollected || 0).toLocaleString()}`,
      icon: TrendingUp,
      description: "Total amount collected",
      color: "text-success"
    },
    {
      title: "Outstanding",
      value: `₹${(stats?.totalOutstanding || 0).toLocaleString()}`,
      icon: AlertTriangle,
      description: "Pending collection",
      color: "text-destructive"
    },
    {
      title: "This Month",
      value: `₹${(stats?.monthlyCollection || 0).toLocaleString()}`,
      icon: CreditCard,
      description: "Monthly collection",
      color: "text-warning"
    },
    {
      title: "Today's Collection",
      value: `₹${(stats?.todaysCollection || 0).toLocaleString()}`,
      icon: CreditCard,
      description: "Real-time today's collection",
      color: "text-success"
    },
    {
      title: "Total Expense",
      value: `₹${(stats?.totalExpense || 0).toLocaleString()}`,
      icon: DollarSign,
      description: "All time expenses",
      color: "text-warning"
    },
    {
      title: "Today's Expense",
      value: `₹${(stats?.todaysExpense || 0).toLocaleString()}`,
      icon: AlertTriangle,
      description: "Today's total spending",
      color: "text-destructive"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Super-Vision Dashboard</h1>
          <p className="text-muted-foreground">
            Complete school management overview
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground">Academic Year 2024-25</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.color === 'text-primary' ? 'bg-primary/10' : 
                card.color === 'text-accent' ? 'bg-accent/10' : 
                card.color === 'text-success' ? 'bg-success/10' : 
                card.color === 'text-destructive' ? 'bg-destructive/10' : 
                card.color === 'text-warning' ? 'bg-warning/10' : 'bg-info/10'}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Deposit Fees Card */}
        <Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-success" />
              </div>
              <div>
                <CardTitle className="text-lg">Deposit Fees</CardTitle>
                <CardDescription>Collect student fee installments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">₹{(stats?.monthlyCollection || 0).toLocaleString()} collected this month</p>
            <a 
              href="/fees/deposit" 
              className="inline-flex items-center justify-center w-full h-10 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors font-medium"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Collect Now
            </a>
          </CardContent>
        </Card>

        {/* Student Fee Data Card */}
        <Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Student Fee Data</CardTitle>
                <CardDescription>View individual student ledgers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{stats?.totalStudents || 0} students tracked</p>
            <a 
              href="/fees/data" 
              className="inline-flex items-center justify-center w-full h-10 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Eye className="w-4 h-4 mr-2" />
              Open Ledger
            </a>
          </CardContent>
        </Card>

        {/* Remaining Fees Card */}
        <Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Remaining Fees</CardTitle>
                <CardDescription>Identify fee defaulters</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">45 students with pending dues</p>
            <a 
              href="/fees/remaining" 
              className="inline-flex items-center justify-center w-full h-10 px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-colors font-medium"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              View Details
            </a>
          </CardContent>
        </Card>

        {/* Data Insights Card */}
        <Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Data Insights</CardTitle>
                <CardDescription>Financial metrics & reports</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Analytics and insights</p>
            <a 
              href="/fees/insights" 
              className="inline-flex items-center justify-center w-full h-10 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Recent Fee Collections */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Fee Collections</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-muted-foreground">Payment history will appear here as transactions are recorded</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}