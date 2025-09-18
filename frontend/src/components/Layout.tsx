import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { ContractModule } from "@/components/ContractModule";
import { PurchaseModule } from "@/components/PurchaseModule";
import { ReportsModule } from "@/components/ReportsModule";
import { AccountModule } from "@/components/AccountModule";
import { GoalsModule } from "@/components/GoalsModule";
import { AnalyticsModule } from "@/components/AnalyticsModule";
import { AIChat } from "@/components/AIChat";
import { NFImportModule } from "@/components/NFImportModule";
import { OneDriveModule } from "@/components/OneDriveModule";
import { CostCenterManager } from "@/components/CostCenterManager";

export const Layout = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove #
      if (hash) {
        setActiveSection(hash);
      }
    };

    // Set initial section from hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Update URL hash without reloading
    window.history.pushState(null, '', `#${section}`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "contracts":
        return <ContractModule />;
      case "purchases":
        return <PurchaseModule />;
      case "reports":
        return <ReportsModule />;
      case "account":
        return <AccountModule />;
      case "goals":
        return <GoalsModule />;
      case "analytics":
        return <AnalyticsModule />;
      case "ai-chat":
        return <AIChat />;
      case "nf-import":
        return <NFImportModule />;
      case "cost-centers":
        return <CostCenterManager />;
      case "onedrive":
        return <OneDriveModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-dashboard">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};