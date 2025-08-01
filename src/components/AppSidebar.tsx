import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  UserPlus, 
  FileText, 
  Eye,
  Wallet,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Students", url: "/students-overview", icon: Users },
  { title: "Fee Management", url: "/fees-overview", icon: CreditCard },
  { title: "Exam Management", url: "/exams-overview", icon: BarChart3 },
  { title: "Reports", url: "/reports-overview", icon: TrendingUp }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium rounded-lg" 
      : "hover:bg-sidebar-accent text-sidebar-foreground rounded-lg transition-colors";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar 
      className={`${isCollapsed ? "w-16" : "w-64"} bg-sidebar border-sidebar-border`} 
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg text-sidebar-foreground">Super-Vision</h2>
                <p className="text-xs text-sidebar-muted-foreground">Management System</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4">
          {menuItems.map((item, index) => (
            <SidebarGroup key={index} className="px-3 mb-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url || "/"} className={getNavCls}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </div>

        {/* Footer */}
        <SidebarFooter className="border-t border-sidebar-border bg-sidebar">
          <div className="p-3">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground">admin</p>
                  <p className="text-xs text-sidebar-muted-foreground truncate">admin@school.edu</p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary-foreground text-sm font-medium">A</span>
              </div>
            )}
            
            {!isCollapsed && (
              <div className="mt-2 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-2 text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-xs">Settings</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-2 text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs">Logout</span>
                </button>
              </div>
            )}
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}