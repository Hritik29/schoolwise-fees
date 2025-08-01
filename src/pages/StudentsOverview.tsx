import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, FileText, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentsOverview() {
  const navigate = useNavigate();

  const studentOptions = [
    {
      title: "Add / Enroll Student",
      description: "Register new students and manage enrollment",
      icon: UserPlus,
      url: "/students/enroll",
      stats: "45 new admissions this month",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Transfer Certificate",
      description: "Generate TC for inactive students",
      icon: FileText,
      url: "/students/transfer",
      stats: "12 inactive students",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "View All Students",
      description: "Search, filter, and manage student records",
      icon: Users,
      url: "/students",
      stats: "1,247 total students",
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground">Manage student records, enrollment, and transfers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentOptions.map((option, index) => {
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