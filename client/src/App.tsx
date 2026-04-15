// =============================================================
// Coffee Affective Tasting App — Main App
// Design: "Specialty Lab" — warm scientific minimalism
// Bottom tab navigation: Taste / Log / Export
// =============================================================

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Coffee, BookOpen, Download, Users, Crosshair } from "lucide-react";
import { CoffeeProvider, useCoffee } from "./contexts/CoffeeContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import TastePage from "./pages/TastePage";
import TastePadPage from "./pages/TastePadPage";
import LogPage from "./pages/LogPage";
import ExportPage from "./pages/ExportPage";
import PanelPage from "./pages/PanelPage";

type Tab = 'taste' | 'pad' | 'log' | 'export' | 'panel';

const TAB_CONFIG: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'taste', label: 'Taste', icon: <Coffee size={20} /> },
  { id: 'pad',   label: 'Pad',   icon: <Crosshair size={20} /> },
  { id: 'log',   label: 'Log',   icon: <BookOpen size={20} /> },
  { id: 'panel', label: 'Panel', icon: <Users size={20} /> },
  { id: 'export',label: 'Export',icon: <Download size={20} /> },
];

function AppContent() {
  const { activeTab, setActiveTab, entries } = useCoffee();

  return (
    <div className="min-h-screen bg-background" style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* Page content */}
      <div className="pb-16">
        {activeTab === 'taste'  && <TastePage />}
        {activeTab === 'pad'    && <TastePadPage />}
        {activeTab === 'log'    && <LogPage />}
        {activeTab === 'panel'  && <PanelPage />}
        {activeTab === 'export' && <ExportPage />}
      </div>

      {/* Bottom navigation */}
      <nav className="bottom-nav">
        {TAB_CONFIG.map(tab => {
          const isActive = activeTab === tab.id;
          const badgeCount = tab.id === 'log' ? entries.length : 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                {tab.icon}
                {badgeCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 text-[9px] font-mono-custom font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ background: 'oklch(0.38 0.08 35)', color: 'white' }}
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-all ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: 'oklch(0.38 0.08 35)' }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <CoffeeProvider>
            <Toaster position="top-center" richColors />
            <AppContent />
          </CoffeeProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
