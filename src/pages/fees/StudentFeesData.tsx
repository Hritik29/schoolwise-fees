import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Eye, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

interface Transaction {
  id: string;
  amount: number;
  transaction_date: string;
  payment_method: string;
  reference_number: string;
  created_by: string;
  remarks: string;
}

export default function StudentFeesData() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeData | null>(null);

  const { data: feesData, isLoading } = useQuery({
    queryKey: ['student-fees-data', searchTerm, statusFilter, classFilter],
    queryFn: async () => {
      let query = supabase
        .from('student_fees')
        .select(`
          *,
          students (
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

      if (searchTerm) {
        query = query.or(`students.first_name.ilike.%${searchTerm}%,students.last_name.ilike.%${searchTerm}%,students.student_id.ilike.%${searchTerm}%`);
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

  const { data: transactions } = useQuery({
    queryKey: ['transactions', selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return [];
      
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*')
        .eq('student_fee_id', selectedStudent.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!selectedStudent
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
                              <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-lg">Student Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Name:</span>
                                        <span className="font-medium">{selectedStudent.students.first_name} {selectedStudent.students.last_name}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Scholar No:</span>
                                        <span className="font-medium">{selectedStudent.students.student_id}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Class:</span>
                                        <span className="font-medium">{selectedStudent.students.class_grade}-{selectedStudent.students.section}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Parent:</span>
                                        <span className="font-medium">{selectedStudent.students.parent_name}</span>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-lg">Fee Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Total Fees:</span>
                                        <span className="font-medium">₹{selectedStudent.total_amount}</span>
                                      </div>
                                      <div className="flex justify-between text-sm text-success">
                                        <span>Paid Amount:</span>
                                        <span className="font-medium">₹{selectedStudent.paid_amount}</span>
                                      </div>
                                      <div className="flex justify-between text-sm text-destructive">
                                        <span>Outstanding:</span>
                                        <span className="font-medium">₹{selectedStudent.outstanding_amount}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Status:</span>
                                        <span>{getStatusBadge(selectedStudent.status)}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Transaction History</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {transactions && transactions.length > 0 ? (
                                      <div className="space-y-3">
                                        {transactions.map((transaction) => (
                                          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                              <p className="font-medium">₹{transaction.amount}</p>
                                              <p className="text-sm text-muted-foreground">
                                                {new Date(transaction.transaction_date).toLocaleDateString()} • {transaction.payment_method}
                                              </p>
                                              {transaction.reference_number && (
                                                <p className="text-xs text-muted-foreground">
                                                  Ref: {transaction.reference_number}
                                                </p>
                                              )}
                                            </div>
                                            <div className="text-right">
                                              <p className="text-sm font-medium">{transaction.created_by}</p>
                                              {transaction.remarks && (
                                                <p className="text-xs text-muted-foreground">{transaction.remarks}</p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-8">
                                        <p className="text-muted-foreground">No transactions found</p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
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