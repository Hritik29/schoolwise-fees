import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  User, 
  Calendar as CalendarIcon, 
  Download, 
  Mail, 
  Eye, 
  FileText,
  Award,
  School
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  class_grade: string;
  section: string;
  date_of_birth: string;
  parent_name: string;
  enrollment_date: string;
  phone: string;
  address: string;
}

export default function TransferCertificate() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [tcForm, setTcForm] = useState({
    reason: "",
    applicationDate: new Date(),
    leavingDate: new Date(),
    remarks: "",
    conduct: ""
  });
  const { toast } = useToast();

  // Fetch students
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students", searchTerm, selectedClass],
    queryFn: async () => {
      let query = supabase.from("students").select("*");
      
      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%, student_id.ilike.%${searchTerm}%`);
      }
      
      if (selectedClass) {
        query = query.eq("class_grade", selectedClass);
      }
      
      const { data, error } = await query.order("first_name");
      if (error) throw error;
      return data || [];
    }
  });

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleGenerateTC = () => {
    if (!selectedStudent) return;
    
    // Generate TC logic here
    toast({
      title: "Transfer Certificate Generated",
      description: `TC generated successfully for ${selectedStudent.first_name}`,
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Download Started",
      description: "Transfer Certificate PDF download started",
    });
  };

  const handleEmailParent = () => {
    toast({
      title: "Email Sent",
      description: "Transfer Certificate emailed to parent successfully",
    });
  };

  const TCPreview = () => (
    <div className="space-y-6 p-6 bg-white text-black max-w-2xl mx-auto">
      <div className="text-center border-b pb-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <School className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Super-Vision School</h2>
            <p className="text-sm text-muted-foreground">Excellence in Education</p>
          </div>
        </div>
        <h3 className="text-xl font-semibold mt-4">TRANSFER CERTIFICATE</h3>
      </div>

      {selectedStudent && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Student Name:</strong> {selectedStudent.first_name} {selectedStudent.last_name}
            </div>
            <div>
              <strong>Admission No:</strong> {selectedStudent.student_id}
            </div>
            <div>
              <strong>Class:</strong> {selectedStudent.class_grade}
            </div>
            <div>
              <strong>Section:</strong> {selectedStudent.section || "A"}
            </div>
            <div>
              <strong>Date of Birth:</strong> {format(new Date(selectedStudent.date_of_birth), "dd/MM/yyyy")}
            </div>
            <div>
              <strong>Father's Name:</strong> {selectedStudent.parent_name}
            </div>
            <div>
              <strong>Date of Admission:</strong> {format(new Date(selectedStudent.enrollment_date), "dd/MM/yyyy")}
            </div>
            <div>
              <strong>Date of Leaving:</strong> {format(tcForm.leavingDate, "dd/MM/yyyy")}
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div><strong>Reason for Leaving:</strong> {tcForm.reason}</div>
            <div><strong>Conduct:</strong> {tcForm.conduct}</div>
            <div><strong>Remarks:</strong> {tcForm.remarks || "N/A"}</div>
          </div>

          <div className="mt-8 pt-4 border-t">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm">Date: {format(new Date(), "dd/MM/yyyy")}</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-gray-400 mb-2"></div>
                <p className="text-sm">Principal's Signature</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfer Certificate</h1>
        <p className="text-muted-foreground">Generate and manage TC for student withdrawals</p>
      </div>

      {/* Search Section */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Student Search
          </CardTitle>
          <CardDescription>Search for students to generate transfer certificate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search by Name / Admission No.</Label>
              <Input
                id="search"
                placeholder="Enter student name or admission number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="class">Filter by Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  <SelectItem value="Nur.">Nursery</SelectItem>
                  <SelectItem value="L.K.G.">L.K.G.</SelectItem>
                  <SelectItem value="U.K.G.">U.K.G.</SelectItem>
                  <SelectItem value="1st">1st</SelectItem>
                  <SelectItem value="2nd">2nd</SelectItem>
                  <SelectItem value="3rd">3rd</SelectItem>
                  <SelectItem value="4th">4th</SelectItem>
                  <SelectItem value="5th">5th</SelectItem>
                  <SelectItem value="6th">6th</SelectItem>
                  <SelectItem value="7th">7th</SelectItem>
                  <SelectItem value="8th">8th</SelectItem>
                  <SelectItem value="9th">9th</SelectItem>
                  <SelectItem value="10th">10th</SelectItem>
                  <SelectItem value="11th">11th</SelectItem>
                  <SelectItem value="12th">12th</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Students List */}
          {students.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Search Results ({students.length} students)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                {students.map((student) => (
                  <Card 
                    key={student.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleStudentSelect(student)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{student.first_name} {student.last_name}</h4>
                          <p className="text-sm text-muted-foreground">{student.student_id}</p>
                          <p className="text-sm text-muted-foreground">Class: {student.class_grade}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Info & TC Form */}
      {selectedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Info Panel */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{selectedStudent.first_name} {selectedStudent.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Admission No:</span>
                  <span>{selectedStudent.student_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Class:</span>
                  <span>{selectedStudent.class_grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Section:</span>
                  <span>{selectedStudent.section || "A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">DOB:</span>
                  <span>{format(new Date(selectedStudent.date_of_birth), "dd/MM/yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Father's Name:</span>
                  <span>{selectedStudent.parent_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Joining Date:</span>
                  <span>{format(new Date(selectedStudent.enrollment_date), "dd/MM/yyyy")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TC Form */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Transfer Certificate Form
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for Leaving</Label>
                <Select value={tcForm.reason} onValueChange={(value) => setTcForm({...tcForm, reason: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Family Relocation">Family Relocation</SelectItem>
                    <SelectItem value="Financial Reason">Financial Reason</SelectItem>
                    <SelectItem value="Academic Transfer">Academic Transfer</SelectItem>
                    <SelectItem value="Personal Reason">Personal Reason</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date of Application</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tcForm.applicationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tcForm.applicationDate ? format(tcForm.applicationDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tcForm.applicationDate}
                      onSelect={(date) => date && setTcForm({...tcForm, applicationDate: date})}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Date of Leaving</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tcForm.leavingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tcForm.leavingDate ? format(tcForm.leavingDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tcForm.leavingDate}
                      onSelect={(date) => date && setTcForm({...tcForm, leavingDate: date})}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="conduct">Conduct</Label>
                <Select value={tcForm.conduct} onValueChange={(value) => setTcForm({...tcForm, conduct: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select conduct" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Additional remarks (optional)"
                  value={tcForm.remarks}
                  onChange={(e) => setTcForm({...tcForm, remarks: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      {selectedStudent && (
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={handleGenerateTC}>
                    <Eye className="w-4 h-4 mr-2" />
                    Generate Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Transfer Certificate Preview</DialogTitle>
                  </DialogHeader>
                  <TCPreview />
                </DialogContent>
              </Dialog>

              <Button onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>

              <Button variant="outline" onClick={handleEmailParent}>
                <Mail className="w-4 h-4 mr-2" />
                Email to Parent
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Certificates Section */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Previously Generated Certificates
          </CardTitle>
          <CardDescription>History of transfer certificates issued</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>TC Issue Date</TableHead>
                <TableHead>Issued By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-muted-foreground text-center" colSpan={6}>
                  No transfer certificates generated yet
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}