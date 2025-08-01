import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Eye, AlertTriangle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeesOverview() {
  const navigate = useNavigate();

  const feeOptions = [
    {
      title: "Deposit Fees",
      description: "Collect installments and process payments",
      icon: Wallet,
      url: "/fees/deposit",
      stats: "₹12,45,000 collected this month",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Student Fee Data",
      description: "View ledger per student and payment history",
      icon: Eye,
      url: "/fees/data",
      stats: "987 students tracked",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Remaining Fees",
      description: "Identify defaulters and send reminders",
      icon: AlertTriangle,
      url: "/fees/remaining",
      stats: "45 students with pending dues",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Data Insights",
      description: "Financial analytics and reports",
      icon: TrendingUp,
      url: "/fees/insights",
      stats: "85.2% collection rate",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
        <p className="text-muted-foreground">Manage student fees, collections, and financial insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {feeOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Card key={index} className="shadow-soft hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {option.stats}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(option.url)}
                    className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}