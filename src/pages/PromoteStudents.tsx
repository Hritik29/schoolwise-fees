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
import { useAcademicSession } from "@/hooks/useAcademicSession";

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
  const { sessions, selectedSession } = useAcademicSession();
  const [fromSession, setFromSession] = useState<string | null>(selectedSession);
  const [toSession, setToSession] = useState<string | null>(selectedSession);
  const [fromClass, setFromClass] = useState<string>("");
  const [toClass, setToClass] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [feeIncreasePercentage, setFeeIncreasePercentage] = useState<number>(0);

  useEffect(() => { document.title = "Promote Students"; }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!fromSession || !fromClass) { setStudents([]); return; }
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('academic_session', fromSession)
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
    
    if (feeIncreasePercentage < 0 || feeIncreasePercentage > 20) {
      toast({ title: 'Invalid percentage', description: 'Fee increase must be between 0-20%', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const selected = students.filter(s => selectedIds.includes(s.id));
      
      // Step 1: Promote students
      const toSessionId = sessions.find(s => s.session_name === toSession)?.id;
      
      if (!toSessionId) {
        toast({ title: 'Session not found', description: 'Target session ID not found', variant: 'destructive' });
        return;
      }

      const studentRows = selected.map((s) => ({
        first_name: s.first_name,
        last_name: s.last_name,
        student_id: `${s.student_id}-${toSession}`, // Make student_id unique by appending session
        class_grade: toClass,
        section: s.section,
        parent_name: s.parent_name,
        parent_phone: s.parent_phone,
        parent_email: s.parent_email,
        phone: s.phone,
        email: s.email,
        address: s.address,
        date_of_birth: s.date_of_birth,
        admission_date: s.admission_date,
        status: s.status,
        aadhar_number: s.aadhar_number,
        sssm_id: s.sssm_id,
        apar_id: s.apar_id,
        account_number: s.account_number,
        ifsc_code: s.ifsc_code,
        bank_account_name: s.bank_account_name,
        academic_session: toSession,
        session_id: toSessionId,
      }));

      const { data: newStudents, error: studentError } = await supabase
        .from('students')
        .insert(studentRows)
        .select();
      
      if (studentError) throw studentError;

      // Step 2: Fetch current fee details and calculate new fees
      const oldStudentIds = selected.map(s => s.id);
      const { data: currentFeeDetails, error: feeDetailsError } = await supabase
        .from('student_fee_details')
        .select('*')
        .in('student_id', oldStudentIds);

      if (feeDetailsError) throw feeDetailsError;

      // Step 3: Create new fee details with increased amounts and previous year fees
      const newFeeDetails = [];
      for (let i = 0; i < newStudents.length; i++) {
        const newStudent = newStudents[i];
        const oldStudent = selected[i];
        const oldFeeDetail = currentFeeDetails?.find(f => f.student_id === oldStudent.id);

        if (oldFeeDetail) {
          // Calculate new total amount with percentage increase
          const increaseFactor = 1 + (feeIncreasePercentage / 100);
          const newTotalAmount = oldFeeDetail.total_amount * increaseFactor;
          
          newFeeDetails.push({
            student_id: newStudent.id,
            fee_type: oldFeeDetail.fee_type,
            total_amount: newTotalAmount,
            paid_amount: 0,
            outstanding_amount: newTotalAmount + oldFeeDetail.outstanding_amount,
            previous_year_fees: oldFeeDetail.outstanding_amount,
            academic_year: toSession
          });
        } else {
          // If no existing fee details, create basic structure
          const { data: feeStructure } = await supabase
            .from('class_fee_structures')
            .select('tuition_fee_yearly')
            .eq('class_grade', toClass)
            .eq('is_active', true)
            .single();

          const baseFee = feeStructure?.tuition_fee_yearly || 0;
          const increaseFactor = 1 + (feeIncreasePercentage / 100);
          const newTotalAmount = baseFee * increaseFactor;

          newFeeDetails.push({
            student_id: newStudent.id,
            fee_type: 'tuition',
            total_amount: newTotalAmount,
            paid_amount: 0,
            outstanding_amount: newTotalAmount,
            previous_year_fees: 0,
            academic_year: toSession
          });
        }
      }

      // Insert new fee details
      if (newFeeDetails.length > 0) {
        const { error: newFeeDetailsError } = await supabase
          .from('student_fee_details')
          .insert(newFeeDetails);

        if (newFeeDetailsError) throw newFeeDetailsError;
      }

      toast({ 
        title: 'Success', 
        description: `${selected.length} students promoted to ${toSession} ${toClass} with ${feeIncreasePercentage}% fee increase` 
      });
      setSelectedIds([]);
      setFeeIncreasePercentage(0);
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
          <div className="space-y-2">
            <Label htmlFor="feeIncrease" className="text-sm font-medium">Fee Increase Percentage (0-20%)</Label>
            <Input
              id="feeIncrease"
              type="number"
              min="0"
              max="20"
              value={feeIncreasePercentage}
              onChange={(e) => setFeeIncreasePercentage(Number(e.target.value))}
              placeholder="Enter percentage (0-20)"
            />
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
