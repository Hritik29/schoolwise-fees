import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageSessions from "./ManageSessions";
import PromoteStudents from "./PromoteStudents";

export default function AcademicSessions() {
  useEffect(() => {
    document.title = "Academic Sessions";
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Academic Sessions</h1>
        <p className="text-muted-foreground">Manage sessions and promote students</p>
      </header>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList>
          <TabsTrigger value="manage">Manage Sessions</TabsTrigger>
          <TabsTrigger value="promote">Promote Students</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <section aria-label="Manage Academic Sessions">
            <ManageSessions />
          </section>
        </TabsContent>

        <TabsContent value="promote">
          <section aria-label="Promote Students Between Sessions">
            <PromoteStudents />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
