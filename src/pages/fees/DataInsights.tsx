import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, DollarSign, Users, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

export default function DataInsights() {
  const { currentSessionId } = useSession();
  
  const { data: insights } = useQuery({
    queryKey: ['fee-insights', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return null;
      
      // Get monthly collection data for current session
      const { data: transactions } = await supabase
        .from('fee_transactions')
        .select('amount, transaction_date, payment_method')
        .eq('session_id', currentSessionId);

      // Get fee type distribution for current session
      const { data: fees } = await supabase
        .from('student_fees')
        .select('total_amount, paid_amount, outstanding_amount, students(class_grade)')
        .eq('session_id', currentSessionId);

      // Get payment method distribution
      const paymentMethods = transactions?.reduce((acc: any, t) => {
        acc[t.payment_method] = (acc[t.payment_method] || 0) + Number(t.amount);
        return acc;
      }, {}) || {};

      // Monthly collection
      const monthlyData = transactions?.reduce((acc: any, t) => {
        const month = new Date(t.transaction_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + Number(t.amount);
        return acc;
      }, {}) || {};

      // Class-wise fee distribution
      const classData = fees?.reduce((acc: any, f) => {
        const className = f.students?.class_grade || 'Unknown';
        if (!acc[className]) {
          acc[className] = { total: 0, collected: 0, outstanding: 0 };
        }
        acc[className].total += Number(f.total_amount);
        acc[className].collected += Number(f.paid_amount);
        acc[className].outstanding += Number(f.outstanding_amount);
        return acc;
      }, {}) || {};

      return {
        monthlyCollection: Object.entries(monthlyData).map(([month, amount]) => ({
          month,
          amount: Number(amount)
        })).slice(-6),
        paymentMethods: Object.entries(paymentMethods).map(([method, amount]) => ({
          method: method.replace('_', ' ').toUpperCase(),
          amount: Number(amount)
        })),
        classDistribution: Object.entries(classData).map(([className, data]: [string, any]) => ({
          class: className,
          total: data.total,
          collected: data.collected,
          outstanding: data.outstanding
        })),
        totalTransactions: transactions?.length || 0,
        totalCollected: transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        totalOutstanding: fees?.reduce((sum, f) => sum + Number(f.outstanding_amount), 0) || 0,
        collectionRate: fees?.length ? 
          (fees.reduce((sum, f) => sum + Number(f.paid_amount), 0) / 
           fees.reduce((sum, f) => sum + Number(f.total_amount), 0)) * 100 : 0
      };
    },
    enabled: !!currentSessionId
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const summaryCards = [
    {
      title: "Total Collected",
      value: `₹${(insights?.totalCollected || 0).toLocaleString()}`,
      icon: DollarSign,
      description: "Total amount collected",
      color: "text-success"
    },
    {
      title: "Outstanding Amount",
      value: `₹${(insights?.totalOutstanding || 0).toLocaleString()}`,
      icon: AlertTriangle,
      description: "Amount pending collection",
      color: "text-destructive"
    },
    {
      title: "Total Transactions",
      value: insights?.totalTransactions || 0,
      icon: CreditCard,
      description: "Number of transactions",
      color: "text-primary"
    },
    {
      title: "Collection Rate",
      value: `${(insights?.collectionRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      description: "Overall collection percentage",
      color: "text-accent"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Insights</h1>
        <p className="text-muted-foreground">Analytics and insights for fee management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Monthly Collection Trend
            </CardTitle>
            <CardDescription>Fee collection over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={insights?.monthlyCollection || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent" />
              Payment Method Distribution
            </CardTitle>
            <CardDescription>Breakdown by payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={insights?.paymentMethods || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {insights?.paymentMethods?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-success" />
            Class-wise Fee Analysis
          </CardTitle>
          <CardDescription>Fee collection and outstanding amounts by class</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={insights?.classDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
              <Bar dataKey="total" fill="#e5e7eb" name="Total Fees" />
              <Bar dataKey="collected" fill="#10b981" name="Collected" />
              <Bar dataKey="outstanding" fill="#ef4444" name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Transaction</span>
              <span className="font-medium">
                ₹{insights?.totalTransactions ? 
                  (insights.totalCollected / insights.totalTransactions).toLocaleString() : 
                  '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Collection Efficiency</span>
              <span className="font-medium text-success">
                {(insights?.collectionRate || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Recovery</span>
              <span className="font-medium text-destructive">
                ₹{(insights?.totalOutstanding || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Top Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights?.paymentMethods?.slice(0, 3).map((method, index) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span className="text-sm font-medium">{method.method}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ₹{method.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Collection Rate</span>
                <span>{(insights?.collectionRate || 0).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(insights?.collectionRate || 0, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Outstanding Risk</span>
                <span>{(100 - (insights?.collectionRate || 0)).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-destructive h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100 - (insights?.collectionRate || 0), 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}