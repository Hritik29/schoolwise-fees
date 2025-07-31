import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/students/Students";
import EnrollStudent from "./pages/students/EnrollStudent";
import EditStudent from "./pages/students/EditStudent";
import TransferCertificate from "./pages/students/TransferCertificate";
import DepositFees from "./pages/fees/DepositFees";
import StudentFeesData from "./pages/fees/StudentFeesData";
import RemainingFees from "./pages/fees/RemainingFees";
import DataInsights from "./pages/fees/DataInsights";
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
            <Route path="/students" element={<Students />} />
            <Route path="/students/enroll" element={<EnrollStudent />} />
            <Route path="/students/edit/:id" element={<EditStudent />} />
            <Route path="/students/transfer" element={<TransferCertificate />} />
            <Route path="/fees/deposit" element={<DepositFees />} />
            <Route path="/fees/data" element={<StudentFeesData />} />
            <Route path="/fees/remaining" element={<RemainingFees />} />
            <Route path="/fees/insights" element={<DataInsights />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
