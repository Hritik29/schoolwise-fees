import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Upload, GraduationCap, Construction } from "lucide-react";

export default function ExamsOverview() {
  const examOptions = [
    {
      title: "Create Exam",
      description: "Set up new examinations and schedules",
      icon: FileText,
      stats: "Coming Soon",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Exam Schedule",
      description: "Manage exam timetables and notifications",
      icon: Calendar,
      stats: "Coming Soon",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Result Upload",
      description: "Upload and manage student results",
      icon: Upload,
      stats: "Coming Soon",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Grading Scheme",
      description: "Configure grading systems and marksheets",
      icon: GraduationCap,
      stats: "Coming Soon",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
        <p className="text-muted-foreground">Manage examinations, schedules, and student assessments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Card key={index} className="shadow-soft opacity-75">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {option.title}
                  <Construction className="w-5 h-5 text-warning" />
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
                  <Button variant="ghost" size="sm" disabled>
                    Under Development
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