import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  LayoutDashboard, ShoppingCart, FileText, CreditCard,
  Clock, Trophy, Banknote, Settings, LogOut, CircleDot
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Purchases from "./pages/Purchases";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Loans from "./pages/Loans";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const NAV = [
  { to: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
  { to: "/purchases",  label: "Nova Compra",  icon: ShoppingCart },
  { to: "/invoices",   label: "Faturas",      icon: FileText },
  { to: "/payments",   label: "Pagar",        icon: CreditCard },
  { to: "/history",    label: "Histórico",    icon: Clock },
  { to: "/analytics",  label: "Ranking",      icon: Trophy },
  { to: "/loans",      label: "Empréstimos",  icon: Banknote },
  { to: "/settings",   label: "Ajustes",      icon: Settings },
];

function PrivateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const logout = () => {
    sessionStorage.removeItem("eln_auth");
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-[#0f1115] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#161920] border-r border-[#1f2229] flex flex-col">
        <div className="px-6 py-7">
          <span className="text-xl font-bold text-[#1e90ff] tracking-widest">ELN FINANCE</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? "bg-[#1f2229] text-[#1e90ff]"
                  : "text-[#8a8d91] hover:bg-[#1f2229] hover:text-white"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-5 border-t border-[#1f2229]">
          <div className="flex items-center gap-2 mb-4">
            <CircleDot size={14} className="text-green-500" />
            <span className="text-xs text-[#8a8d91] font-bold tracking-widest">TERMINAL ONLINE</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-[#8a8d91] hover:text-red-400 transition-colors"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/purchases"  element={<Purchases />} />
          <Route path="/invoices"   element={<Invoices />} />
          <Route path="/payments"   element={<Payments />} />
          <Route path="/history"    element={<History />} />
          <Route path="/analytics"  element={<Analytics />} />
          <Route path="/loans"      element={<Loans />} />
          <Route path="/settings"   element={<SettingsPage />} />
          <Route path="*"           element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = sessionStorage.getItem("eln_auth");
  return auth ? <>{children}</> : <Navigate to="/" />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <PrivateLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
