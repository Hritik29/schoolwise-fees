import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PrinterIcon, Download } from "lucide-react";

interface ReceiptSlipProps {
  student: {
    first_name: string;
    last_name: string;
    student_id: string;
    class_grade: string;
    section: string;
    parent_name: string;
  };
  payment: {
    amount: number;
    payment_method: string;
    reference_number?: string;
    fee_type: string;
    transaction_date: string;
  };
  receiptNumber: string;
}

export default function ReceiptSlip({ student, payment, receiptNumber }: ReceiptSlipProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a blob with the receipt content
    const receiptContent = `
RECEIPT
School Fees Management System
==============================

Receipt No: ${receiptNumber}
Date: ${new Date(payment.transaction_date).toLocaleDateString()}

Student Details:
Name: ${student.first_name} ${student.last_name}
Scholar Number: ${student.student_id}
Class: ${student.class_grade}-${student.section}
Parent: ${student.parent_name}

Payment Details:
Amount Paid: ₹${payment.amount}
Fee Type: ${payment.fee_type}
Payment Method: ${payment.payment_method}
${payment.reference_number ? `Reference: ${payment.reference_number}` : ''}

==============================
Thank you for your payment!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-md mx-auto print:max-w-full print:mx-0">
      <Card className="shadow-elegant print:shadow-none">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-xl font-bold text-primary">PAYMENT RECEIPT</CardTitle>
          <p className="text-sm text-muted-foreground">School Fees Management System</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Receipt No:</span>
            <span className="font-mono">{receiptNumber}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="font-medium">Date:</span>
            <span>{new Date(payment.transaction_date).toLocaleDateString()}</span>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-primary">Student Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-medium">{student.first_name} {student.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Scholar No:</span>
                <span className="font-medium">{student.student_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Class:</span>
                <span className="font-medium">{student.class_grade}-{student.section}</span>
              </div>
              <div className="flex justify-between">
                <span>Parent:</span>
                <span className="font-medium">{student.parent_name}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-primary">Payment Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Fee Type:</span>
                <span className="font-medium capitalize">{payment.fee_type}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium capitalize">{payment.payment_method.replace('_', ' ')}</span>
              </div>
              {payment.reference_number && (
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-medium font-mono">{payment.reference_number}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Amount Paid:</span>
              <span className="text-2xl font-bold text-primary">₹{payment.amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground mt-6">
            <p>Thank you for your payment!</p>
            <p>Keep this receipt for your records.</p>
          </div>

          <div className="flex gap-2 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <PrinterIcon className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}