import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAcademicSession } from "@/hooks/useAcademicSession";

interface Session {
  id: string;
  session_name: string;
  is_active: boolean;
  created_at: string;
}

export default function ManageSessions() {
  const { toast } = useToast();
  const { sessions: hookSessions, refresh } = useAcademicSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newSessionName, setNewSessionName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Manage Academic Sessions";
  }, []);

  useEffect(() => {
    setSessions(hookSessions);
  }, [hookSessions]);

  const addSession = async () => {
    if (!newSessionName.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('academic_sessions').insert({ session_name: newSessionName.trim(), is_active: false });
      if (error) throw error;
      setNewSessionName("");
      toast({ title: "Added", description: "Session created" });
      await refresh();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || 'Failed to add session', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const setActive = async (id: string) => {
    setLoading(true);
    try {
      // Ensure only one active: first deactivate others, then activate selected
      const { error: offErr } = await supabase.from('academic_sessions').update({ is_active: false }).neq('id', id);
      if (offErr) throw offErr;
      const { error } = await supabase.from('academic_sessions').update({ is_active: true }).eq('id', id);
      if (error) throw error;
      toast({ title: "Updated", description: "Active session set" });
      await refresh();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || 'Failed to update session', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Manage Academic Sessions</h1>
        <p className="text-muted-foreground">Create and set the active academic session</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Add New Session</CardTitle>
          <CardDescription>Example: 2025-26</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="e.g. 2025-26"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
          />
          <Button onClick={addSession} disabled={loading || !newSessionName.trim()}>Add</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>Only one session can be active at a time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.session_name}</TableCell>
                    <TableCell>
                      {s.is_active ? (
                        <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setActive(s.id)} disabled={s.is_active || loading}>
                        Set Active
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
