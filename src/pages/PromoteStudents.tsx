import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  class_grade: string;
  section: string | null;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  date_of_birth: string | null;
  admission_date: string | null;
  status: string;
  aadhar_number: string | null;
  sssm_id: string | null;
  apar_id: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  bank_account_name: string | null;
}

const CLASS_OPTIONS = [
  "Nur.", "L.K.G.", "U.K.G.", "1st", "2nd", "3rd", "4th", "5th",
  "6th", "7th", "8th", "9th", "10th", "11th", "12th"
];

export default function PromoteStudents() {
  const { toast } = useToast();
  const { sessions, currentSessionId } = useSession();
  const currentSessionName = sessions.find(s => s.id === currentSessionId)?.session_name;
  const [fromSession, setFromSession] = useState<string | null>(currentSessionName || null);
  const [toSession, setToSession] = useState<string | null>(currentSessionName || null);
  const [fromClass, setFromClass] = useState<string>("");
  const [toClass, setToClass] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = "Promote Students"; }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!fromSession || !fromClass) { setStudents([]); return; }
      
      const fromSessionId = sessions.find(s => s.session_name === fromSession)?.id;
      if (!fromSessionId) { setStudents([]); return; }
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('session_id', fromSessionId)
        .eq('class_grade', fromClass)
        .order('first_name');
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      setStudents(data || []);
      // Select all students by default
      setSelectedIds((data || []).map(s => s.id));
    };
    fetchStudents();
  }, [fromSession, fromClass]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const promote = async () => {
    if (!toSession || !toClass || selectedIds.length === 0) {
      toast({ title: 'Select required fields', description: 'Pick students, target class and session', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const selected = students.filter(s => selectedIds.includes(s.id));
      const toSessionId = sessions.find(s => s.session_name === toSession)?.id;
      
      if (!toSessionId) {
        toast({ title: 'Session not found', description: 'Target session ID not found', variant: 'destructive' });
        return;
      }

      // Check if students already exist in target session to prevent duplicates
      const existingEnrollments = await supabase
        .from('student_enrollments')
        .select('student_id')
        .eq('session_id', toSessionId)
        .in('student_id', selected.map(s => s.id));

      if (existingEnrollments.data && existingEnrollments.data.length > 0) {
        const duplicateStudents = selected.filter(s => 
          existingEnrollments.data.some(e => e.student_id === s.id)
        );
        const duplicateNames = duplicateStudents.map(s => `${s.first_name} ${s.last_name}`).join(', ');
        toast({ 
          title: 'Students already enrolled', 
          description: `Students ${duplicateNames} already exist in ${toSession}`, 
          variant: 'destructive' 
        });
        return;
      }

      // Use the new promote_student function for each student
      for (const student of selected) {
        const { error } = await supabase.rpc('promote_student', {
          p_student_id: student.id,
          p_new_class: toClass,
          p_new_section: student.section,
          p_new_session: toSessionId
        });

        if (error) throw error;
      }

      toast({ 
        title: 'Success', 
        description: `${selected.length} students promoted to ${toSession} ${toClass}` 
      });
      setSelectedIds([]);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Promotion failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Promote Students</h1>
        <p className="text-muted-foreground">Copy selected students into another session with a new class</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Selection</CardTitle>
          <CardDescription>Choose source and target</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Session</label>
            <Select value={fromSession ?? undefined} onValueChange={setFromSession}>
              <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
              <SelectContent>
                {sessions.map(s => (
                  <SelectItem key={s.id} value={s.session_name}>{s.session_name}{s.is_active ? ' (Active)' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Class</label>
            <Select value={fromClass} onValueChange={setFromClass}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {CLASS_OPTIONS.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Session</label>
            <Select value={toSession ?? undefined} onValueChange={setToSession}>
              <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
              <SelectContent>
                {sessions.map(s => (
                  <SelectItem key={s.id} value={s.session_name}>{s.session_name}{s.is_active ? ' (Active)' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Class</label>
            <Select value={toClass} onValueChange={setToClass}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {CLASS_OPTIONS.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Select students to promote</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Scholar No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Checkbox checked={selectedIds.includes(s.id)} onCheckedChange={() => toggleSelect(s.id)} />
                    </TableCell>
                    <TableCell className="font-medium">{s.student_id}</TableCell>
                    <TableCell>{s.first_name} {s.last_name}</TableCell>
                    <TableCell>{s.class_grade} {s.section ? `- ${s.section}` : ''}</TableCell>
                    <TableCell>{s.parent_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={promote} disabled={loading || selectedIds.length === 0 || !toClass || !toSession}>
              Promote Selected
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
