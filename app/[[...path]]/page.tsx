"use client";

import { usePathname } from "next/navigation";
import NotFound from "@/views/NotFound";
import Login from "@/views/Login";
import EmployeeDashboard from "@/views/employee/Dashboard";
import AddLog from "@/views/employee/AddLog";
import MyLogs from "@/views/employee/MyLogs";
import LogDetail from "@/views/employee/LogDetail";
import EmployeeProfile from "@/views/employee/Profile";
import AdminDashboard from "@/views/admin/Dashboard";
import AllUsers from "@/views/admin/AllUsers";
import UserDetail from "@/views/admin/UserDetail";
import TodayLogs from "@/views/admin/TodayLogs";
import AllLogs from "@/views/admin/AllLogs";
import SEOReports from "@/views/admin/SEOReports";
import SEODetail from "@/views/admin/SEODetail";
import ActivityLogs from "@/views/admin/ActivityLogs";
import AdminProfile from "@/views/admin/Profile";
import Messaging from "@/views/shared/Messaging";
import Notifications from "@/views/shared/Notifications";
import MasterAdminDashboard from "@/views/master-admin/Dashboard";
import TaskBoard from "@/views/shared/TaskBoard";

export default function Page() {
  const pathname = usePathname();

  // Root
  if (pathname === "/") return <Login />;

  // Employee Routes
  if (pathname === "/employee/dashboard") return <EmployeeDashboard />;
  if (pathname === "/employee/today") return <TodayLogs />;
  if (pathname === "/employee/tasks") return <AllLogs />;
  if (pathname === "/employee/add-log") return <AddLog />;
  if (pathname.startsWith("/employee/logs/edit/")) return <AddLog />;
  if (pathname === "/employee/logs") return <AllLogs />;
  if (pathname.startsWith("/employee/logs/")) return <LogDetail />;
  if (pathname === "/employee/profile") return <EmployeeProfile />;
  if (pathname === "/employee/messages") return <Messaging />;

  // Admin Routes
  if (pathname === "/admin/dashboard") return <AdminDashboard />;
  if (pathname === "/admin/tasks") return <AllLogs />;
  if (pathname === "/admin/users") return <AllUsers />;
  if (pathname.startsWith("/admin/users/")) return <UserDetail />;
  if (pathname === "/admin/today") return <TodayLogs />;
  if (pathname === "/admin/logs") return <AllLogs />;
  if (pathname === "/admin/seo-reports") return <SEOReports />;
  if (pathname.startsWith("/admin/seo-reports/")) return <SEODetail />;
  if (pathname.startsWith("/admin/logs/")) return <LogDetail />;
  if (pathname === "/admin/activity") return <ActivityLogs />;
  if (pathname === "/admin/profile") return <AdminProfile />;
  if (pathname === "/admin/messages") return <Messaging />;

  // Master Admin Routes
  if (pathname === "/master-admin/dashboard") return <MasterAdminDashboard />;
  if (pathname === "/master-admin/tasks") return <AllLogs />;
  if (pathname === "/master-admin/users") return <AllUsers />;
  if (pathname.startsWith("/master-admin/users/")) return <UserDetail />;
  if (pathname === "/master-admin/today") return <TodayLogs />;
  if (pathname === "/master-admin/logs") return <AllLogs />;
  if (pathname === "/master-admin/seo-reports") return <SEOReports />;
  if (pathname.startsWith("/master-admin/seo-reports/")) return <SEODetail />;
  if (pathname === "/master-admin/profile") return <AdminProfile />;
  if (pathname === "/master-admin/messages") return <Messaging />;

  // Shared
  if (pathname === "/notifications") return <Notifications />;

  return <NotFound />;
}
