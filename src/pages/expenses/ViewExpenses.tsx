import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Filter, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAcademicSession } from "@/hooks/useAcademicSession";

interface Expense {
  id: string;
  expense_title: string;
  category: string;
  amount: number;
  date: string;
  added_by: string;
  description: string;
  created_at: string;
}

export default function ViewExpenses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const { activeSession } = useAcademicSession();

  const categories = [
    "Stationery",
    "Furniture", 
    "Utilities",
    "Salary",
    "Maintenance",
    "Others"
  ];

const fetchExpenses = async () => {
    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (activeSession) {
        query = query.eq('academic_session', activeSession.session_name);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
      setFilteredExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
    fetchExpenses();
  }, [activeSession]);

  useEffect(() => {
    let filtered = expenses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.expense_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Month filter
    if (monthFilter !== "all") {
      const currentYear = new Date().getFullYear();
      const month = parseInt(monthFilter);
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === currentYear;
      });
    }

    setFilteredExpenses(filtered);
  }, [searchTerm, categoryFilter, monthFilter, expenses]);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Stationery": "bg-blue-100 text-blue-800",
      "Furniture": "bg-green-100 text-green-800",
      "Utilities": "bg-yellow-100 text-yellow-800",
      "Salary": "bg-purple-100 text-purple-800",
      "Maintenance": "bg-red-100 text-red-800",
      "Others": "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/expense-overview')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">View Expenses</h1>
          <p className="text-muted-foreground mt-2">
            Browse and manage all expense records
          </p>
        </div>
        <Button onClick={() => navigate('/expenses/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Active Session</label>
              <div className="text-sm text-muted-foreground p-2 border rounded">
                {activeSession?.session_name || 'No active session'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {format(new Date(2024, i, 1), 'MMMM')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Records Found</p>
              <p className="text-2xl font-bold">{filteredExpenses.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>
            All expense transactions sorted by date
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading expenses...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expenses found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Added By</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {format(new Date(expense.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {expense.expense_title}
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(expense.category)}>
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{Number(expense.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{expense.added_by}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {expense.description || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}