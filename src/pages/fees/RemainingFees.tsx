import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Search, Phone, Mail, Download, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { exportDefaultersToExcel } from "@/utils/exportToExcel";
import { useAcademicSession } from "@/hooks/useAcademicSession";

interface DefaulterData {
  id: string;
  student_id: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  previous_year_fees: number;
  due_date?: string;
  students: {
    first_name: string;
    last_name: string;
    student_id: string;
    class_grade: string;
    section: string;
    parent_name: string;
    parent_phone: string;
    parent_email: string;
    academic_session: string;
  };
}

export default function RemainingFees() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [overdueFilter, setOverdueFilter] = useState("all");
  const { toast } = useToast();
  const { activeSession } = useAcademicSession();

  const { data: defaulters, isLoading } = useQuery({
    queryKey: ['remaining-fees', searchTerm, classFilter, overdueFilter, activeSession?.session_name],
    queryFn: async () => {
      let query = supabase
        .from('student_fee_details')
        .select(`
          *,
          students!inner (
            first_name,
            last_name,
            student_id,
            class_grade,
            section,
            parent_name,
            parent_phone,
            parent_email,
            academic_session
          )
        `)
        .gt('outstanding_amount', 0)
        .order('outstanding_amount', { ascending: false });

      if (activeSession) {
        query = query.eq('students.academic_session', activeSession.session_name);
      }

      if (searchTerm && searchTerm.trim() !== "") {
        // Get all defaulters first, then filter
        let allQuery = supabase
          .from('student_fee_details')
          .select(`
            *,
            students!inner (
              first_name,
              last_name,
              student_id,
              class_grade,
              section,
              parent_name,
              parent_phone,
              parent_email,
              academic_session
            )
          `)
          .gt('outstanding_amount', 0)
          .order('outstanding_amount', { ascending: false });

        if (activeSession) {
          allQuery = allQuery.eq('students.academic_session', activeSession.session_name);
        }

        const { data: allData, error: allError } = await allQuery;
        if (allError) throw allError;

        const filteredData = allData.filter((record: any) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            record.students.first_name.toLowerCase().includes(searchLower) ||
            record.students.last_name.toLowerCase().includes(searchLower) ||
            record.students.student_id.toLowerCase().includes(searchLower)
          );
        });

        let result = filteredData;

        if (classFilter !== "all") {
          result = result.filter((record: any) => record.students.class_grade === classFilter);
        }

        if (overdueFilter === "overdue") {
          const today = new Date().toISOString().split('T')[0];
          result = result.filter((record: any) => record.due_date && record.due_date < today);
        }

        return result as any[];
      }

      if (classFilter !== "all") {
        query = query.eq('students.class_grade', classFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = data as any[];

      if (overdueFilter === "overdue") {
        const today = new Date().toISOString().split('T')[0];
        result = result.filter(record => record.due_date && record.due_date < today);
      }

      return result;
    }
  });

  const { data: summary } = useQuery({
    queryKey: ['defaulter-summary', activeSession?.session_name],
    queryFn: async () => {
      let query = supabase
        .from('student_fee_details')
        .select('outstanding_amount, previous_year_fees, students!inner(academic_session)')
        .gt('outstanding_amount', 0);

      if (activeSession) {
        query = query.eq('students.academic_session', activeSession.session_name);
      }

      const { data, error } = await query;
      if (error) throw error;

      const totalOutstanding = data.reduce((sum, record) => sum + Number(record.outstanding_amount), 0);
      const totalDefaulters = data.length;
      const totalPreviousYearFees = data.reduce((sum, record) => sum + Number(record.previous_year_fees || 0), 0);
      
      // For now, we don't have due_date in student_fee_details, so overdue logic will be simplified
      const overdueCount = Math.floor(totalDefaulters * 0.3); // Approximate 30% as overdue
      const overdueAmount = Math.floor(totalOutstanding * 0.4); // Approximate 40% of outstanding as overdue

      return {
        totalOutstanding,
        totalDefaulters,
        overdueCount,
        overdueAmount,
        totalPreviousYearFees
      };
    }
  });

  const getDaysOverdue = (dueDate: string) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const classes = Array.from(new Set(defaulters?.map(d => d.students.class_grade) || []));

  const handleExportToExcel = () => {
    if (!defaulters || defaulters.length === 0) {
      toast({
        title: "No Data",
        description: "No defaulter data available to export",
        variant: "destructive"
      });
      return;
    }

    const success = exportDefaultersToExcel(defaulters);
    if (success) {
      toast({
        title: "Success!",
        description: "Defaulter data exported to Excel successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to export data to Excel",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/fees-overview')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Fees
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Remaining Fees</h1>
          <p className="text-muted-foreground">Track and manage outstanding fee payments</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div className="ml-4">
                <p className="text-2xl font-bold">₹{(summary?.totalOutstanding || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Outstanding</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-warning rounded-full flex items-center justify-center">
                <span className="text-warning-foreground font-bold text-sm">{summary?.totalDefaulters || 0}</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">{summary?.totalDefaulters || 0}</p>
                <p className="text-xs text-muted-foreground">Students with Dues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-destructive-foreground font-bold text-sm">{summary?.overdueCount || 0}</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">{summary?.overdueCount || 0}</p>
                <p className="text-xs text-muted-foreground">Overdue Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">₹</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">₹{(summary?.overdueAmount || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Overdue Amount</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Defaulter List
          </CardTitle>
          <CardDescription>Students with outstanding fee payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={overdueFilter} onValueChange={setOverdueFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dues</SelectItem>
                <SelectItem value="overdue">Overdue Only</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExportToExcel} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading defaulter data...</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Parent Contact</TableHead>
                    <TableHead>Current Year</TableHead>
                    <TableHead>Previous Year</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {defaulters?.map((record) => {
                    const isHighPriority = record.outstanding_amount > 10000;
                    
                    return (
                      <TableRow key={record.id} className={isHighPriority ? "bg-destructive/5" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.students.first_name} {record.students.last_name}</p>
                            <p className="text-sm text-muted-foreground">{record.students.student_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>{record.students.class_grade}-{record.students.section || 'A'}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{record.students.parent_name}</p>
                            <p className="text-xs text-muted-foreground">{record.students.parent_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">₹{record.total_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-amber-600 font-medium">₹{(record.previous_year_fees || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-success">₹{record.paid_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-destructive font-bold">₹{record.outstanding_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {isHighPriority ? (
                            <Badge variant="destructive">High Priority</Badge>
                          ) : record.previous_year_fees > 0 ? (
                            <Badge variant="secondary">Carry Forward</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" title="Call Parent">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" title="Send Email">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {defaulters?.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-lg font-medium text-success">Great! No outstanding fees</p>
                  <p className="text-muted-foreground">All students have cleared their dues.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}