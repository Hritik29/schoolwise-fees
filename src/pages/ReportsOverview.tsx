import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, BarChart3, TrendingUp, Construction, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReportsOverview() {
  const navigate = useNavigate();

  const reportOptions = [
    {
      title: "Fee Reports",
      description: "Real-time fee collection and analysis reports",
      icon: CreditCard,
      url: "/reports/fees",
      stats: "₹12,45,000 total collection",
      color: "text-green-600",
      bgColor: "bg-green-50",
      available: true
    },
    {
      title: "Attendance Reports",
      description: "Student attendance tracking and summaries",
      icon: Users,
      url: "#",
      stats: "Coming Soon",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      available: false
    },
    {
      title: "Performance Reports",
      description: "Academic performance and progress reports",
      icon: BarChart3,
      url: "#",
      stats: "Coming Soon",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      available: false
    },
    {
      title: "Financial Analytics",
      description: "Revenue analysis and financial insights",
      icon: TrendingUp,
      url: "#",
      stats: "Coming Soon",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      available: false
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate comprehensive reports and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Card 
              key={index} 
              className={`shadow-soft hover:shadow-md transition-shadow cursor-pointer group ${
                !option.available ? 'opacity-75' : ''
              }`}
              onClick={() => option.available && navigate(option.url)}
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {option.title}
                  {!option.available && <Construction className="w-5 h-5 text-warning" />}
                </CardTitle>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {option.stats}
                  </span>
                  {option.available ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(option.url);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Open
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      Under Development
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}