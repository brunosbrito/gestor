import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserProfile from "@/components/UserProfile";
import {
  BarChart3,
  FileText,
  ShoppingCart,
  Settings,
  MessageSquare,
  Home,
  DollarSign,
  Target,
  ChevronLeft,
  ChevronRight,
  Building2,
  Receipt,
  Tag
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "contracts", label: "Contratos", icon: Building2 },
    { id: "purchases", label: "Compras", icon: ShoppingCart },
    { id: "nf-import", label: "Importar NFs", icon: Receipt },
    { id: "cost-centers", label: "Centros de Custo", icon: Tag },
    { id: "reports", label: "Relatórios", icon: FileText },
    { id: "account", label: "Conta Corrente", icon: DollarSign },
    { id: "goals", label: "Metas", icon: Target },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "ai-chat", label: "IA Assistant", icon: MessageSquare },
  ];

  return (
    <div className={cn(
      "bg-gradient-card border-r border-border h-screen transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">GMX</h2>
                <p className="text-xs text-muted-foreground">Custos de Obras</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-11",
                isCollapsed ? "px-2" : "px-3",
                isActive && "shadow-elegant"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {!isCollapsed && (
                <span className="ml-2">{item.label}</span>
              )}
            </Button>
          );
        })}
      </div>

      {/* User Section */}
      <div className="mt-auto p-2 space-y-2">
        <ThemeToggle isCollapsed={isCollapsed} />
        {!isCollapsed && <UserProfile />}
        {isCollapsed && (
          <div className="p-2 bg-muted/50 rounded-lg border">
            <Settings className="h-4 w-4 mx-auto text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};