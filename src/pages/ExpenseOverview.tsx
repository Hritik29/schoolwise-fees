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

export default function ExpenseOverview() {
  const navigate = useNavigate();

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
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
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
            <div className="text-2xl font-bold">₹0</div>
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
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground">
              Fees - Expenses
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}