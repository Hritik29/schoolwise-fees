import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DetailedLedgerProps {
  studentId: string;
  studentInfo: {
    first_name: string;
    last_name: string;
    student_id: string;
    class_grade: string;
    section: string;
    parent_name: string;
  };
}

export default function DetailedLedger({ studentId, studentInfo }: DetailedLedgerProps) {
  const { data: feeDetails } = useQuery({
    queryKey: ['student-fee-details', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_fee_details')
        .select('*')
        .eq('student_id', studentId)
        .order('fee_type');

      if (error) throw error;
      return data;
    }
  });

  const { data: transactions } = useQuery({
    queryKey: ['student-transactions', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*')
        .eq('student_id', studentId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const feeTypeColors = {
    tuition: { bg: "bg-primary/10", border: "border-primary/20", text: "text-primary" },
    admission: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent" },
    transport: { bg: "bg-warning/10", border: "border-warning/20", text: "text-warning" },
    other: { bg: "bg-secondary/10", border: "border-secondary/20", text: "text-secondary-foreground" },
    previous_year: { bg: "bg-destructive/10", border: "border-destructive/20", text: "text-destructive" }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (outstanding: number) => {
    if (outstanding <= 0) {
      return <Badge className="bg-success text-success-foreground">Paid</Badge>;
    } else if (outstanding > 0) {
      return <Badge variant="destructive">Due</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  // Define all fee types that should always be displayed
  const allFeeTypes = [
    { type: 'tuition', label: 'Tuition Fees' },
    { type: 'transport', label: 'Transport' },
    { type: 'admission', label: 'Admission Fee' },
    { type: 'other', label: 'Other Fees' },
    { type: 'previous_year', label: 'Previous Year Fee' }
  ];

  // Create a complete fee breakdown with all fee types
  const completeFeeBreakdown = allFeeTypes.map(feeType => {
    const existingFee = feeDetails?.find(fee => fee.fee_type === feeType.type);
    return {
      fee_type: feeType.type,
      label: feeType.label,
      total_amount: existingFee?.total_amount || 0,
      paid_amount: existingFee?.paid_amount || 0,
      outstanding_amount: existingFee?.outstanding_amount || 0,
      id: existingFee?.id || `${feeType.type}-placeholder`
    };
  });

  const totalFees = completeFeeBreakdown.reduce((sum, fee) => sum + fee.total_amount, 0);
  const totalPaid = completeFeeBreakdown.reduce((sum, fee) => sum + fee.paid_amount, 0);
  const totalOutstanding = completeFeeBreakdown.reduce((sum, fee) => sum + fee.outstanding_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header - Student Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Detailed Fee Ledger</CardTitle>
            <CardDescription>
              Complete fee breakdown for {studentInfo.first_name} {studentInfo.last_name}
            </CardDescription>
          </div>
          <Button onClick={handlePrint} variant="outline" size="sm" className="print:hidden">
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print Ledger
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Student Info</p>
              <p className="font-medium">{studentInfo.first_name} {studentInfo.last_name}</p>
              <p className="text-sm text-muted-foreground">Scholar: {studentInfo.student_id}</p>
              <p className="text-sm text-muted-foreground">Class: {studentInfo.class_grade}-{studentInfo.section}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Parent</p>
              <p className="font-medium">{studentInfo.parent_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-bold text-destructive">₹{totalOutstanding.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Breakdown by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown by Type</CardTitle>
          <CardDescription>Detailed view of each fee category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completeFeeBreakdown.map((fee) => {
              const colors = feeTypeColors[fee.fee_type as keyof typeof feeTypeColors] || feeTypeColors.other;
              return (
                <div key={fee.id} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-semibold ${colors.text}`}>
                        {fee.label}
                      </h3>
                      {getStatusBadge(fee.outstanding_amount)}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">₹{fee.total_amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-medium">₹{fee.total_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-success">Paid Amount</p>
                      <p className="font-medium text-success">₹{fee.paid_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-destructive">Outstanding</p>
                      <p className="font-medium text-destructive">₹{fee.outstanding_amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Summary Totals */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-xl font-bold">₹{totalFees.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-success">Total Paid</p>
                <p className="text-xl font-bold text-success">₹{totalPaid.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive">Total Outstanding</p>
                <p className="text-xl font-bold text-destructive">₹{totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Chronological list of all payments</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium">₹{transaction.amount.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.applied_to_fee_type?.replace('_', ' ') || transaction.fee_type?.replace('_', ' ') || 'General'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.transaction_date).toLocaleDateString()} • 
                      {transaction.payment_method.toUpperCase()}
                      {transaction.reference_number && ` • Ref: ${transaction.reference_number}`}
                    </p>
                    {transaction.remarks && (
                      <p className="text-xs text-muted-foreground mt-1">{transaction.remarks}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{transaction.created_by}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payment history found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}