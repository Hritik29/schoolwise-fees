import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, FileText, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { exportFeesDataToExcel } from "@/utils/exportToExcel";
import DetailedLedger from "@/components/DetailedLedger";

interface StudentFeeData {
  id: string;
  student_id: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  status: string;
  due_date: string;
  students: {
    first_name: string;
    last_name: string;
    student_id: string;
    class_grade: string;
    section: string;
    parent_name: string;
    parent_phone: string;
  };
}

export default function StudentFeesData() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeData | null>(null);
  const { toast } = useToast();

  const { data: feesData, isLoading } = useQuery({
    queryKey: ['student-fees-data', searchTerm, statusFilter, classFilter],
    queryFn: async () => {
      let query = supabase
        .from('student_fees')
        .select(`
          *,
          students!inner (
            first_name,
            last_name,
            student_id,
            class_grade,
            section,
            parent_name,
            parent_phone
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm && searchTerm.trim() !== "") {
        // Use proper filtering with the nested relationship
        const { data: allData, error: allError } = await supabase
          .from('student_fees')
          .select(`
            *,
            students!inner (
              first_name,
              last_name,
              student_id,
              class_grade,
              section,
              parent_name,
              parent_phone
            )
          `)
          .order('created_at', { ascending: false });

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

        if (statusFilter !== "all") {
          result = result.filter((record: any) => record.status === statusFilter);
        }

        if (classFilter !== "all") {
          result = result.filter((record: any) => record.students.class_grade === classFilter);
        }

        return result as StudentFeeData[];
      }

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      if (classFilter !== "all") {
        query = query.eq('students.class_grade', classFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StudentFeeData[];
    }
  });


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-success text-success-foreground">Paid</Badge>;
      case 'partial':
        return <Badge variant="default" className="bg-warning text-warning-foreground">Partial</Badge>;
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const classes = Array.from(new Set(feesData?.map(f => f.students.class_grade) || []));

  const handleExportToExcel = () => {
    if (!feesData || feesData.length === 0) {
      toast({
        title: "No Data",
        description: "No fee data available to export",
        variant: "destructive"
      });
      return;
    }

    const success = exportFeesDataToExcel(feesData);
    if (success) {
      toast({
        title: "Success!",
        description: "Fee data exported to Excel successfully"
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Fees Data</h1>
        <p className="text-muted-foreground">View and manage all student fee records</p>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>Complete overview of student fee payments</CardDescription>
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

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

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
            <Button onClick={handleExportToExcel} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading fee records...</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feesData?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.students.first_name} {record.students.last_name}</p>
                          <p className="text-sm text-muted-foreground">{record.students.student_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{record.students.class_grade}-{record.students.section}</TableCell>
                      <TableCell className="font-medium">₹{record.total_amount}</TableCell>
                      <TableCell className="text-success font-medium">₹{record.paid_amount}</TableCell>
                      <TableCell className="text-destructive font-medium">₹{record.outstanding_amount}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.due_date ? new Date(record.due_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedStudent(record)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Ledger
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Student Fee Ledger</DialogTitle>
                              <DialogDescription>
                                Complete fee transaction history for {selectedStudent?.students.first_name} {selectedStudent?.students.last_name}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedStudent && (
                              <DetailedLedger 
                                studentId={selectedStudent.student_id}
                                studentInfo={{
                                  first_name: selectedStudent.students.first_name,
                                  last_name: selectedStudent.students.last_name,
                                  student_id: selectedStudent.students.student_id,
                                  class_grade: selectedStudent.students.class_grade,
                                  section: selectedStudent.students.section,
                                  parent_name: selectedStudent.students.parent_name
                                }}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {feesData?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No fee records found.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}