import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import EmployeeDashboard from "./pages/employee/Dashboard.tsx";
import AddLog from "./pages/employee/AddLog.tsx";
import MyLogs from "./pages/employee/MyLogs.tsx";
import LogDetail from "./pages/employee/LogDetail.tsx";
import EmployeeProfile from "./pages/employee/Profile.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AllUsers from "./pages/admin/AllUsers.tsx";
import UserDetail from "./pages/admin/UserDetail.tsx";
import TodayLogs from "./pages/admin/TodayLogs.tsx";
import AllLogs from "./pages/admin/AllLogs.tsx";
import ActivityLogs from "./pages/admin/ActivityLogs.tsx";
import AdminProfile from "./pages/admin/Profile.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Employee */}
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/add-log" element={<AddLog />} />
            <Route path="/employee/logs" element={<MyLogs />} />
            <Route path="/employee/logs/:id" element={<LogDetail />} />
            <Route path="/employee/profile" element={<EmployeeProfile />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AllUsers />} />
            <Route path="/admin/users/:id" element={<UserDetail />} />
            <Route path="/admin/today" element={<TodayLogs />} />
            <Route path="/admin/logs" element={<AllLogs />} />
            <Route path="/admin/logs/:id" element={<LogDetail />} />
            <Route path="/admin/activity" element={<ActivityLogs />} />
            <Route path="/admin/profile" element={<AdminProfile />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
