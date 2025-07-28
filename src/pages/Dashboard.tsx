import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, AlertTriangle, TrendingUp, GraduationCap, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [studentsResult, feesResult, transactionsResult] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact' }),
        supabase.from('student_fees').select('total_amount, paid_amount, outstanding_amount'),
        supabase.from('fee_transactions').select('amount, transaction_date')
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

      return {
        totalStudents,
        totalFees,
        totalCollected,
        totalOutstanding,
        monthlyCollection,
        collectionRate: totalFees > 0 ? (totalCollected / totalFees) * 100 : 0
      };
    }
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
      title: "Collection Rate",
      value: `${(stats?.collectionRate || 0).toFixed(1)}%`,
      icon: GraduationCap,
      description: "Overall collection percentage",
      color: "text-primary"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your school fees management system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={index} className="shadow-soft hover:shadow-medium transition-all duration-200">
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/students/enroll" className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Enroll New Student</p>
                <p className="text-sm text-muted-foreground">Add a new student to the system</p>
              </div>
            </a>
            <a href="/fees/deposit" className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors">
              <CreditCard className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium">Deposit Fees</p>
                <p className="text-sm text-muted-foreground">Record fee payments</p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions and enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-muted-foreground">Latest updates will appear here</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}