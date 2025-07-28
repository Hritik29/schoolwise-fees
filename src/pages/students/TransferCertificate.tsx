import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function TransferCertificate() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfer Certificate</h1>
        <p className="text-muted-foreground">Generate transfer certificates for students</p>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="w-5 h-5 text-warning" />
            Coming Soon
          </CardTitle>
          <CardDescription>Transfer certificate functionality is under development</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            This feature will allow you to generate transfer certificates for students who are leaving the school.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}