import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Search, Eye, Edit, Filter, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { exportStudentsToExcel } from "@/utils/exportToExcel";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,student_id.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleExportToExcel = () => {
    if (!students || students.length === 0) {
      toast({
        title: "No Data",
        description: "No student data available to export",
        variant: "destructive"
      });
      return;
    }

    const success = exportStudentsToExcel(students);
    if (success) {
      toast({
        title: "Success!",
        description: "Student data exported to Excel successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to export data to Excel",
        variant: "destructive"
      });
    }
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
  };

  const handleEditStudent = (student: any) => {
    // TODO: Implement edit functionality
    toast({
      title: "Coming Soon",
      description: "Edit functionality will be implemented soon"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage all enrolled students</p>
        </div>
        <Button onClick={() => navigate('/students/enroll')} className="bg-primary hover:bg-primary/90">
          <UserPlus className="w-4 h-4 mr-2" />
          Enroll Student
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>View and manage student records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or scholar number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button onClick={handleExportToExcel} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scholar No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Parent Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students?.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{student.class_grade}</TableCell>
                      <TableCell>{student.section}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.parent_name}</p>
                          <p className="text-sm text-muted-foreground">{student.parent_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not provided'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewStudent(student)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Student Details</DialogTitle>
                                <DialogDescription>
                                  Complete information for {selectedStudent?.first_name} {selectedStudent?.last_name}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedStudent && (
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                      <p className="font-medium">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Scholar Number</label>
                                      <p className="font-medium">{selectedStudent.student_id}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Class & Section</label>
                                      <p className="font-medium">{selectedStudent.class_grade} - {selectedStudent.section}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                                      <p className="font-medium">{selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                                      <div className="mt-1">{getStatusBadge(selectedStudent.status)}</div>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Parent Name</label>
                                      <p className="font-medium">{selectedStudent.parent_name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Parent Phone</label>
                                      <p className="font-medium">{selectedStudent.parent_phone}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Parent Email</label>
                                      <p className="font-medium">{selectedStudent.parent_email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Student Email</label>
                                      <p className="font-medium">{selectedStudent.email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                                      <p className="font-medium">{selectedStudent.address || 'Not provided'}</p>
                                    </div>
                                     <div>
                                       <label className="text-sm font-medium text-muted-foreground">Enrollment Date</label>
                                       <p className="font-medium">{new Date(selectedStudent.enrollment_date).toLocaleDateString()}</p>
                                     </div>
                                     <div>
                                       <label className="text-sm font-medium text-muted-foreground">Aadhar Number</label>
                                       <p className="font-medium">{selectedStudent.aadhar_number || 'Not provided'}</p>
                                     </div>
                                     <div>
                                       <label className="text-sm font-medium text-muted-foreground">SSSM ID</label>
                                       <p className="font-medium">{selectedStudent.sssm_id || 'Not provided'}</p>
                                     </div>
                                     <div>
                                       <label className="text-sm font-medium text-muted-foreground">Apar ID</label>
                                       <p className="font-medium">{selectedStudent.apar_id || 'Not provided'}</p>
                                     </div>
                                     <div>
                                       <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                                       <p className="font-medium">{selectedStudent.account_number || 'Not provided'}</p>
                                     </div>
                                   </div>
                                 </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {students?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No students found.</p>
                  <Button 
                    onClick={() => navigate('/students/enroll')} 
                    className="mt-4"
                    variant="outline"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Enroll First Student
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}