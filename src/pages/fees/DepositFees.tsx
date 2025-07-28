import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, User, CreditCard, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SelectedStudent {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  class_grade: string;
  section: string;
  parent_name: string;
  parent_phone: string;
}

interface StudentFees {
  id: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
}

export default function DepositFees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);
  const [studentFees, setStudentFees] = useState<StudentFees | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    payerName: "",
    paymentMethod: "cash",
    referenceNumber: "",
    remarks: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['student-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, student_id, class_grade, section, parent_name, parent_phone')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,student_id.ilike.%${searchTerm}%`)
        .eq('status', 'active')
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: searchTerm.length >= 2
  });

  const selectStudent = async (student: SelectedStudent) => {
    setSelectedStudent(student);
    
    // Fetch student fees
    const { data: fees, error } = await supabase
      .from('student_fees')
      .select('*')
      .eq('student_id', student.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Could not fetch student fees data",
        variant: "destructive"
      });
      return;
    }

    setStudentFees(fees);
    setPaymentData(prev => ({ ...prev, payerName: student.parent_name }));
  };

  const handlePayment = async () => {
    if (!selectedStudent || !studentFees || !paymentData.amount) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(paymentData.amount);
    if (amount <= 0 || amount > studentFees.outstanding_amount) {
      toast({
        title: "Error",
        description: "Invalid payment amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('fee_transactions')
        .insert({
          student_id: selectedStudent.id,
          student_fee_id: studentFees.id,
          amount: amount,
          payment_method: paymentData.paymentMethod,
          reference_number: paymentData.referenceNumber,
          remarks: paymentData.remarks,
          created_by: paymentData.payerName
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Payment recorded successfully",
      });

      // Reset form
      setSelectedStudent(null);
      setStudentFees(null);
      setPaymentData({
        amount: "",
        payerName: "",
        paymentMethod: "cash",
        referenceNumber: "",
        remarks: ""
      });
      setSearchTerm("");

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deposit Fees</h1>
        <p className="text-muted-foreground">Record fee payments for students</p>
      </div>

      {!selectedStudent ? (
        <Card className="shadow-soft max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Search Student
            </CardTitle>
            <CardDescription>Search by name, scholar number, or roll number</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Enter student name or scholar number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-center text-lg h-12"
                />
              </div>

              {searchLoading && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              )}

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => selectStudent(student)}
                      className="p-4 border rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Scholar: {student.student_id} • Class: {student.class_grade}-{student.section}
                          </p>
                        </div>
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm.length >= 2 && searchResults?.length === 0 && !searchLoading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No students found matching your search.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Student Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Student Name</Label>
                <p className="font-medium">{selectedStudent.first_name} {selectedStudent.last_name}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Scholar Number</Label>
                <p className="font-medium">{selectedStudent.student_id}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Class & Section</Label>
                <p className="font-medium">{selectedStudent.class_grade} - {selectedStudent.section}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Parent Details</Label>
                <p className="font-medium">{selectedStudent.parent_name}</p>
                <p className="text-sm text-muted-foreground">{selectedStudent.parent_phone}</p>
              </div>

              {studentFees && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Fee Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Fees:</span>
                      <span className="font-medium">₹{studentFees.total_amount}</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span>Paid Amount:</span>
                      <span className="font-medium">₹{studentFees.paid_amount}</span>
                    </div>
                    <div className="flex justify-between text-destructive">
                      <span>Outstanding:</span>
                      <span className="font-medium">₹{studentFees.outstanding_amount}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStudent(null);
                  setStudentFees(null);
                  setPaymentData({
                    amount: "",
                    payerName: "",
                    paymentMethod: "cash",
                    referenceNumber: "",
                    remarks: ""
                  });
                }}
                className="w-full"
              >
                Change Student
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="amount"
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                    className="pl-10"
                    max={studentFees?.outstanding_amount}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payerName">Payer Name *</Label>
                <Input
                  id="payerName"
                  value={paymentData.payerName}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, payerName: e.target.value }))}
                  placeholder="Enter payer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  placeholder="Transaction/Receipt number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={paymentData.remarks}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>

              <Button
                onClick={handlePayment}
                disabled={loading || !paymentData.amount || !paymentData.payerName}
                className="w-full bg-success hover:bg-success/90"
              >
                {loading ? "Processing..." : "Record Payment"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}