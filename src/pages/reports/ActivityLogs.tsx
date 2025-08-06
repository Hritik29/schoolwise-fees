import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Download, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function ActivityLogs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  const { data: logs, isLoading } = useQuery({
    queryKey: ['activity-logs', searchTerm, moduleFilter],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (searchTerm && searchTerm.trim() !== "") {
        query = query.or(`user_email.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (moduleFilter !== "all") {
        query = query.eq('module', moduleFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const modules = Array.from(new Set(logs?.map(log => log.module) || []));

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return <Badge variant="default" className="bg-success text-success-foreground">Login</Badge>;
      case 'logout':
        return <Badge variant="secondary">Logout</Badge>;
      case 'create':
      case 'add':
        return <Badge variant="default" className="bg-primary text-primary-foreground">Create</Badge>;
      case 'update':
      case 'edit':
        return <Badge variant="default" className="bg-warning text-warning-foreground">Update</Badge>;
      case 'delete':
        return <Badge variant="destructive">Delete</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/reports-overview')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">Track user activities and system changes</p>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            System Activity Logs
          </CardTitle>
          <CardDescription>Monitor all user actions and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading activity logs...</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{new Date(log.created_at).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{log.user_email}</p>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.module}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-xs truncate">{log.description}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{log.ip_address || 'Unknown'}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {logs?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No activity logs found.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}