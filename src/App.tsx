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
import NotFound from "./pages/NotFound";

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
            <Route path="/exams-overview" element={<ExamsOverview />} />
            <Route path="/reports-overview" element={<ReportsOverview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
