import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import StudentsOverview from "./pages/StudentsOverview";
import Students from "./pages/students/Students";
import EnrollStudent from "./pages/students/EnrollStudent";
import EditStudent from "./pages/students/EditStudent";
import TransferCertificate from "./pages/students/TransferCertificate";
import FeesOverview from "./pages/FeesOverview";
import DepositFees from "./pages/fees/DepositFees";
import StudentFeesData from "./pages/fees/StudentFeesData";
import RemainingFees from "./pages/fees/RemainingFees";
import DataInsights from "./pages/fees/DataInsights";
import ExamsOverview from "./pages/ExamsOverview";
import ReportsOverview from "./pages/ReportsOverview";
import FeesReport from "./pages/reports/FeesReport";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ExpenseOverview from "./pages/ExpenseOverview";
import AddExpense from "./pages/expenses/AddExpense";
import ViewExpenses from "./pages/expenses/ViewExpenses";
import FinancialOverview from "./pages/expenses/FinancialOverview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students-overview" element={<StudentsOverview />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/enroll" element={<EnrollStudent />} />
            <Route path="/students/edit/:id" element={<EditStudent />} />
            <Route path="/students/transfer" element={<TransferCertificate />} />
            <Route path="/fees-overview" element={<FeesOverview />} />
            <Route path="/fees/deposit" element={<DepositFees />} />
            <Route path="/fees/data" element={<StudentFeesData />} />
            <Route path="/fees/remaining" element={<RemainingFees />} />
            <Route path="/fees/insights" element={<DataInsights />} />
            <Route path="/expense-overview" element={<ExpenseOverview />} />
            <Route path="/expenses/add" element={<AddExpense />} />
            <Route path="/expenses/view" element={<ViewExpenses />} />
            <Route path="/expenses/overview" element={<FinancialOverview />} />
            <Route path="/exams-overview" element={<ExamsOverview />} />
        <Route path="/reports-overview" element={<ReportsOverview />} />
        <Route path="/reports/fees" element={<FeesReport />} />
        <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
