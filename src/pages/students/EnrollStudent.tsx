import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, User, CreditCard, DollarSign, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface StudentData {
  firstName: string;
  fatherName: string;
  motherName: string;
  phone: string;
  scholarNumber: string;
  rollNumber: string;
  classGrade: string;
  section: string;
  email: string;
  address: string;
  dateOfBirth: string;
  isActive: boolean;
  useTransport: boolean;
  tuitionFees: number;
  admissionFees: number;
  transportFees: number;
  otherFees: number;
  previousYearFees: number;
  discount: number;
  aadharNumber: string;
  sssmId: string;
  aparId: string;
  accountNumber: string;
}

export default function EnrollStudent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: classFees } = useQuery({
    queryKey: ['class-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_fee_structures')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  const [studentData, setStudentData] = useState<StudentData>({
    firstName: "",
    fatherName: "",
    motherName: "",
    phone: "",
    scholarNumber: "",
    rollNumber: "",
    classGrade: "",
    section: "",
    email: "",
    address: "",
    dateOfBirth: "",
    isActive: true,
    useTransport: false,
    tuitionFees: 2000,
    admissionFees: 0,
    transportFees: 0,
    otherFees: 0,
    previousYearFees: 0,
    discount: 0,
    aadharNumber: "",
    sssmId: "",
    aparId: "",
    accountNumber: ""
  });

  const classOptions = [
    "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", 
    "6th", "7th", "8th", "9th", "10th", "11th", "12th"
  ];

  const sectionOptions = ["A", "B", "C"];

  const handleInputChange = (field: keyof StudentData, value: any) => {
    setStudentData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-update tuition fees when class changes
      if (field === 'classGrade' && classFees) {
        const classData = classFees.find(c => c.class_grade === value);
        if (classData) {
          updated.tuitionFees = classData.tuition_fee_yearly;
        }
      }
      
      return updated;
    });
  };

  const validateStep1 = () => {
    const required = ['firstName', 'fatherName', 'phone', 'scholarNumber', 'rollNumber', 'classGrade', 'section', 'aadharNumber', 'sssmId', 'aparId', 'accountNumber'];
    const basicValidation = required.every(field => studentData[field as keyof StudentData]);
    const aadharValid = studentData.aadharNumber.length === 12;
    const accountValid = studentData.accountNumber.length > 0;
    return basicValidation && aadharValid && accountValid;
  };

  const calculateTotalFees = () => {
    const { tuitionFees, admissionFees, transportFees, otherFees, previousYearFees, discount } = studentData;
    // Discount applies only to tuition fees
    const discountAmount = (tuitionFees * discount) / 100;
    const discountedTuitionFees = tuitionFees - discountAmount;
    const total = discountedTuitionFees + admissionFees + transportFees + otherFees + previousYearFees;
    return total;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create student record
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          first_name: studentData.firstName,
          last_name: "",
          student_id: studentData.scholarNumber,
          class_grade: studentData.classGrade,
          section: studentData.section,
          parent_name: studentData.fatherName,
          parent_phone: studentData.phone,
          parent_email: studentData.email,
          phone: studentData.phone,
          email: studentData.email,
          address: studentData.address,
          date_of_birth: studentData.dateOfBirth || null,
          status: studentData.isActive ? 'active' : 'inactive',
          aadhar_number: studentData.aadharNumber,
          sssm_id: studentData.sssmId,
          apar_id: studentData.aparId,
          account_number: studentData.accountNumber
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // Create fee structure if needed
      const { data: feeStructure, error: feeError } = await supabase
        .from('fee_structures')
        .insert({
          fee_type: 'tuition',
          amount: studentData.tuitionFees,
          class_grade: studentData.classGrade,
          frequency: 'monthly',
          description: `Tuition fees for ${studentData.classGrade} - ${studentData.section}`
        })
        .select()
        .single();

      if (feeError) throw feeError;

      // Create student fees record
      const totalAmount = calculateTotalFees();
      const { error: studentFeesError } = await supabase
        .from('student_fees')
        .insert({
          student_id: student.id,
          fee_structure_id: feeStructure.id,
          total_amount: totalAmount,
          paid_amount: 0,
          outstanding_amount: totalAmount,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        });

      if (studentFeesError) throw studentFeesError;

      toast({
        title: "Success!",
        description: "Student enrolled successfully.",
      });

      // Reset form and go back to step 1 for next enrollment
      setStudentData({
        firstName: "",
        fatherName: "",
        motherName: "",
        phone: "",
        scholarNumber: "",
        rollNumber: "",
        classGrade: "",
        section: "",
        email: "",
        address: "",
        dateOfBirth: "",
        isActive: true,
        useTransport: false,
        tuitionFees: 2000,
        admissionFees: 0,
        transportFees: 0,
        otherFees: 0,
        previousYearFees: 0,
        discount: 0,
        aadharNumber: "",
        sssmId: "",
        aparId: "",
        accountNumber: ""
      });
      setCurrentStep(1);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/students')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enroll New Student</h1>
          <p className="text-muted-foreground">Add a new student to the system</p>
        </div>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <User className="w-5 h-5" />
          </div>
          <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {currentStep === 1 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Step 1: Student Information</CardTitle>
            <CardDescription>Enter basic student details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={studentData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name *</Label>
                <Input
                  id="fatherName"
                  value={studentData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  placeholder="Enter father's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName">Mother's Name</Label>
                <Input
                  id="motherName"
                  value={studentData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  placeholder="Enter mother's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={studentData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scholarNumber">Scholar Number *</Label>
                <Input
                  id="scholarNumber"
                  value={studentData.scholarNumber}
                  onChange={(e) => handleInputChange('scholarNumber', e.target.value)}
                  placeholder="Enter scholar number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number *</Label>
                <Input
                  id="rollNumber"
                  value={studentData.rollNumber}
                  onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                  placeholder="Enter roll number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classGrade">Class *</Label>
                <Select value={studentData.classGrade} onValueChange={(value) => handleInputChange('classGrade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Select value={studentData.section} onValueChange={(value) => handleInputChange('section', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={studentData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={studentData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                <Input
                  id="aadharNumber"
                  value={studentData.aadharNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                    handleInputChange('aadharNumber', value);
                  }}
                  placeholder="Enter 12-digit Aadhar number"
                  maxLength={12}
                />
                {studentData.aadharNumber && studentData.aadharNumber.length !== 12 && (
                  <p className="text-xs text-destructive">Aadhar number must be exactly 12 digits</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sssmId">SSSM ID *</Label>
                <Input
                  id="sssmId"
                  value={studentData.sssmId}
                  onChange={(e) => handleInputChange('sssmId', e.target.value)}
                  placeholder="Enter SSSM ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aparId">Apar ID *</Label>
                <Input
                  id="aparId"
                  value={studentData.aparId}
                  onChange={(e) => handleInputChange('aparId', e.target.value)}
                  placeholder="Enter Apar ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={studentData.accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    handleInputChange('accountNumber', value);
                  }}
                  placeholder="Enter bank account number"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={studentData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={studentData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Student is Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="useTransport"
                  checked={studentData.useTransport}
                  onCheckedChange={(checked) => handleInputChange('useTransport', checked)}
                />
                <Label htmlFor="useTransport">Uses Transport</Label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setCurrentStep(2)} 
                disabled={!validateStep1()}
                className="bg-primary hover:bg-primary/90"
              >
                Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Step 2: Fee Details</CardTitle>
            <CardDescription>Configure fee structure for the student</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tuitionFees">Tuition Fees (Yearly) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="tuitionFees"
                    type="number"
                    value={studentData.tuitionFees}
                    placeholder="Auto-filled based on class"
                    className="pl-10 bg-muted cursor-not-allowed"
                    readOnly
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">Automatically set based on selected class</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admissionFees">Admission Fees</Label>
                <Input
                  id="admissionFees"
                  type="number"
                  value={studentData.admissionFees}
                  onChange={(e) => handleInputChange('admissionFees', Number(e.target.value))}
                  placeholder="Enter admission fees"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transportFees">Transport Fees</Label>
                <Input
                  id="transportFees"
                  type="number"
                  value={studentData.transportFees}
                  onChange={(e) => handleInputChange('transportFees', Number(e.target.value))}
                  placeholder="Enter transport fees"
                  disabled={!studentData.useTransport}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherFees">Other Fees</Label>
                <Input
                  id="otherFees"
                  type="number"
                  value={studentData.otherFees}
                  onChange={(e) => handleInputChange('otherFees', Number(e.target.value))}
                  placeholder="Enter other fees"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousYearFees">Previous Year Fees</Label>
                <Input
                  id="previousYearFees"
                  type="number"
                  value={studentData.previousYearFees}
                  onChange={(e) => handleInputChange('previousYearFees', Number(e.target.value))}
                  placeholder="Enter previous year dues"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%) - Max 30%</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="30"
                  value={studentData.discount}
                  onChange={(e) => {
                    const value = Math.min(30, Math.max(0, Number(e.target.value)));
                    handleInputChange('discount', value);
                  }}
                  placeholder="Enter discount percentage (0-30%)"
                />
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Fee Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">Tuition Fees (Yearly)</p>
                    <p className="text-lg font-bold text-foreground">₹{studentData.tuitionFees.toLocaleString()}</p>
                  </div>
                  <div className="bg-accent/5 p-3 rounded-lg border border-accent/20">
                    <p className="text-sm text-muted-foreground">Admission Fees</p>
                    <p className="text-lg font-bold text-foreground">₹{studentData.admissionFees.toLocaleString()}</p>
                  </div>
                  <div className="bg-warning/5 p-3 rounded-lg border border-warning/20">
                    <p className="text-sm text-muted-foreground">Transport Fees</p>
                    <p className="text-lg font-bold text-foreground">₹{studentData.transportFees.toLocaleString()}</p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                    <p className="text-sm text-muted-foreground">Other Fees</p>
                    <p className="text-lg font-bold text-foreground">₹{studentData.otherFees.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Previous Year Fees</p>
                    <p className="text-lg font-bold text-foreground">₹{studentData.previousYearFees.toLocaleString()}</p>
                  </div>
                  <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-destructive text-destructive-foreground text-xs">DISCOUNT</Badge>
                      <span className="text-xs text-muted-foreground">({studentData.discount}% on Tuition)</span>
                    </div>
                    <p className="text-lg font-bold text-destructive">-₹{(studentData.tuitionFees * studentData.discount / 100).toLocaleString()}</p>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between bg-success/10 p-4 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-success" />
                      <span className="text-lg font-medium text-foreground">Total Amount:</span>
                    </div>
                    <span className="text-2xl font-bold text-success">₹{calculateTotalFees().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-success hover:bg-success/90"
              >
                {loading ? "Enrolling..." : "Enroll Student"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}