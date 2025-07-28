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
  TrendingUp
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
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  {
    title: "Students",
    items: [
      { title: "Enroll Student", url: "/students/enroll", icon: UserPlus },
      { title: "View All Students", url: "/students", icon: Users },
      { title: "Transfer Certificate", url: "/students/transfer", icon: FileText },
    ]
  },
  {
    title: "Fees Management", 
    items: [
      { title: "Deposit Fees", url: "/fees/deposit", icon: Wallet },
      { title: "Student Fees Data", url: "/fees/data", icon: Eye },
      { title: "Remaining Fees", url: "/fees/remaining", icon: AlertTriangle },
      { title: "Data Insights", url: "/fees/insights", icon: TrendingUp },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-secondary text-foreground";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg">SchoolWise</h2>
                <p className="text-xs text-muted-foreground">Fee Management</p>
              </div>
            )}
          </div>
        </div>

        {menuItems.map((item, index) => (
          <SidebarGroup key={index}>
            {item.title && !item.items && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
            
            {item.items && (
              <>
                <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
                  {item.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={subItem.url} className={getNavCls}>
                            <subItem.icon className="mr-2 h-4 w-4" />
                            {!isCollapsed && <span>{subItem.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}