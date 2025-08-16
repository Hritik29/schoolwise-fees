import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FeeDetail {
  id?: string;
  fee_type: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  previous_year_fees: number;
  academic_year: string;
}

interface FeeManagementProps {
  studentId: string;
  academicSession: string;
  onUpdate?: () => void;
}

const FEE_TYPES = [
  { value: "tuition", label: "Tuition Fee" },
  { value: "admission", label: "Admission Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "sports", label: "Sports Fee" },
  { value: "library", label: "Library Fee" },
  { value: "examination", label: "Examination Fee" },
  { value: "annual", label: "Annual Fee" },
  { value: "miscellaneous", label: "Miscellaneous Fee" }
];

export default function FeeManagement({ studentId, academicSession, onUpdate }: FeeManagementProps) {
  const [feeDetails, setFeeDetails] = useState<FeeDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const [newFee, setNewFee] = useState({
    fee_type: "",
    total_amount: 0,
    previous_year_fees: 0
  });

  const fetchFeeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('student_fee_details')
        .select('*')
        .eq('student_id', studentId)
        .eq('academic_year', academicSession)
        .order('fee_type');

      if (error) throw error;
      setFeeDetails(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (studentId && academicSession) {
      fetchFeeDetails();
    }
  }, [studentId, academicSession]);

  const handleAddFee = async () => {
    if (!newFee.fee_type || newFee.total_amount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select fee type and enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const outstanding = newFee.total_amount + newFee.previous_year_fees;
      
      const { error } = await supabase
        .from('student_fee_details')
        .insert({
          student_id: studentId,
          fee_type: newFee.fee_type,
          total_amount: newFee.total_amount,
          paid_amount: 0,
          outstanding_amount: outstanding,
          previous_year_fees: newFee.previous_year_fees,
          academic_year: academicSession
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee added successfully",
      });

      setNewFee({ fee_type: "", total_amount: 0, previous_year_fees: 0 });
      setShowAddForm(false);
      fetchFeeDetails();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFee = async (fee: FeeDetail) => {
    setLoading(true);
    try {
      const outstanding = fee.total_amount + fee.previous_year_fees - fee.paid_amount;
      
      const { error } = await supabase
        .from('student_fee_details')
        .update({
          total_amount: fee.total_amount,
          outstanding_amount: outstanding,
          previous_year_fees: fee.previous_year_fees
        })
        .eq('id', fee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee updated successfully",
      });

      setEditingId(null);
      fetchFeeDetails();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFee = async (feeId: string) => {
    if (!confirm("Are you sure you want to delete this fee?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('student_fee_details')
        .delete()
        .eq('id', feeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee deleted successfully",
      });

      fetchFeeDetails();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFeeField = (id: string, field: keyof FeeDetail, value: number) => {
    setFeeDetails(prev => prev.map(fee => 
      fee.id === id ? { ...fee, [field]: value } : fee
    ));
  };

  const getFeeTypeLabel = (type: string) => {
    return FEE_TYPES.find(ft => ft.value === type)?.label || type;
  };

  const totalOutstanding = feeDetails.reduce((sum, fee) => sum + fee.outstanding_amount, 0);
  const totalPaid = feeDetails.reduce((sum, fee) => sum + fee.paid_amount, 0);
  const totalAmount = feeDetails.reduce((sum, fee) => sum + fee.total_amount + fee.previous_year_fees, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fee Management</CardTitle>
            <CardDescription>Manage all fee types for this student</CardDescription>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)} 
            size="sm"
            disabled={showAddForm}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Fee
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-lg font-bold">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Paid Amount</p>
            <p className="text-lg font-bold text-success">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-lg font-bold text-destructive">₹{totalOutstanding.toLocaleString()}</p>
          </div>
        </div>

        {/* Add Fee Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Fee</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fee Type</Label>
                <Select value={newFee.fee_type} onValueChange={(value) => setNewFee(prev => ({ ...prev, fee_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Current Year Amount</Label>
                <Input
                  type="number"
                  value={newFee.total_amount}
                  onChange={(e) => setNewFee(prev => ({ ...prev, total_amount: Number(e.target.value) }))}
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Previous Year Dues</Label>
                <Input
                  type="number"
                  value={newFee.previous_year_fees}
                  onChange={(e) => setNewFee(prev => ({ ...prev, previous_year_fees: Number(e.target.value) }))}
                  placeholder="Enter previous dues"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleAddFee} disabled={loading} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Add Fee
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fee Details List */}
        <div className="space-y-3">
          {feeDetails.map((fee) => (
            <Card key={fee.id} className="p-4">
              <div className="grid grid-cols-6 gap-4 items-center">
                <div>
                  <Badge variant="secondary">{getFeeTypeLabel(fee.fee_type)}</Badge>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Current Year</Label>
                  {editingId === fee.id ? (
                    <Input
                      type="number"
                      value={fee.total_amount}
                      onChange={(e) => updateFeeField(fee.id!, 'total_amount', Number(e.target.value))}
                      className="h-8"
                    />
                  ) : (
                    <p className="font-medium">₹{fee.total_amount.toLocaleString()}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Previous Dues</Label>
                  {editingId === fee.id ? (
                    <Input
                      type="number"
                      value={fee.previous_year_fees}
                      onChange={(e) => updateFeeField(fee.id!, 'previous_year_fees', Number(e.target.value))}
                      className="h-8"
                    />
                  ) : (
                    <p className="font-medium text-amber-600">₹{fee.previous_year_fees.toLocaleString()}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Paid</Label>
                  <p className="font-medium text-success">₹{fee.paid_amount.toLocaleString()}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Outstanding</Label>
                  <p className="font-medium text-destructive">₹{fee.outstanding_amount.toLocaleString()}</p>
                </div>

                <div className="flex gap-2">
                  {editingId === fee.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateFee(fee)}
                        disabled={loading}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(fee.id!)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteFee(fee.id!)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {feeDetails.length === 0 && (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No fees configured for this student</p>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(true)}
                className="mt-2"
              >
                Add First Fee
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}