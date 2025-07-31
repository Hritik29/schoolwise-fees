import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function EditStudent() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const [studentData, setStudentData] = useState({
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
    aadharNumber: "",
    sssmId: "",
    aparId: "",
    accountNumber: ""
  });

  useEffect(() => {
    if (student) {
      setStudentData({
        firstName: student.first_name || "",
        fatherName: student.parent_name || "",
        motherName: "",
        phone: student.parent_phone || "",
        scholarNumber: student.student_id || "",
        rollNumber: "",
        classGrade: student.class_grade || "",
        section: student.section || "",
        email: student.parent_email || "",
        address: student.address || "",
        dateOfBirth: student.date_of_birth || "",
        isActive: student.status === 'active',
        aadharNumber: student.aadhar_number || "",
        sssmId: student.sssm_id || "",
        aparId: student.apar_id || "",
        accountNumber: student.account_number || ""
      });
    }
  }, [student]);

  const classOptions = [
    "Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", 
    "6th", "7th", "8th", "9th", "10th", "11th", "12th"
  ];

  const sectionOptions = ["A", "B", "C"];

  const handleInputChange = (field: string, value: any) => {
    setStudentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({
          first_name: studentData.firstName,
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
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Student information updated successfully.",
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

  if (isLoading) {
    return <div className="text-center py-8">Loading student data...</div>;
  }

  if (!student) {
    return <div className="text-center py-8">Student not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/students')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
          <p className="text-muted-foreground">Update student information</p>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Update student details</CardDescription>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={studentData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive">Student is Active</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/students')}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-success hover:bg-success/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Updating..." : "Update Student"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}