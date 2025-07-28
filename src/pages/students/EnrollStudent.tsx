import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, User, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
}

export default function EnrollStudent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    discount: 0
  });

  const classOptions = [
    "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", 
    "6th", "7th", "8th", "9th", "10th", "11th", "12th"
  ];

  const sectionOptions = ["A", "B", "C"];

  const handleInputChange = (field: keyof StudentData, value: any) => {
    setStudentData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    const required = ['firstName', 'fatherName', 'phone', 'scholarNumber', 'rollNumber', 'classGrade', 'section'];
    return required.every(field => studentData[field as keyof StudentData]);
  };

  const calculateTotalFees = () => {
    const { tuitionFees, admissionFees, transportFees, otherFees, previousYearFees, discount } = studentData;
    const total = tuitionFees + admissionFees + transportFees + otherFees + previousYearFees;
    const discountAmount = (total * discount) / 100;
    return total - discountAmount;
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
          status: studentData.isActive ? 'active' : 'inactive'
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

      navigate('/students');
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
                <Label htmlFor="tuitionFees">Tuition Fees (Monthly) *</Label>
                <Input
                  id="tuitionFees"
                  type="number"
                  value={studentData.tuitionFees}
                  onChange={(e) => handleInputChange('tuitionFees', Number(e.target.value))}
                  placeholder="Enter tuition fees"
                />
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

            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-2">Fee Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Tuition Fees:</span>
                  <span>₹{studentData.tuitionFees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Admission Fees:</span>
                  <span>₹{studentData.admissionFees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transport Fees:</span>
                  <span>₹{studentData.transportFees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Fees:</span>
                  <span>₹{studentData.otherFees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Previous Year Fees:</span>
                  <span>₹{studentData.previousYearFees}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Discount ({studentData.discount}%):</span>
                  <span>-₹{((studentData.tuitionFees + studentData.admissionFees + studentData.transportFees + studentData.otherFees + studentData.previousYearFees) * studentData.discount / 100).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>₹{calculateTotalFees()}</span>
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