import React, { useState, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "@/components/LoginPage";

const AdminDashboard = lazy(() => import("@/components/AdminDashboard"));
const VendorDashboard = lazy(() => import("@/components/VendorDashboard"));

const queryClient = new QueryClient();

type Role = "admin" | "vendor";
interface User { name: string; email: string; id: string; }

const App = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (r: Role, u: User) => { setRole(r); setUser(u); };
  const handleLogout = () => { setRole(null); setUser(null); };

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Loading MVMS…</p>
          </div>
        </div>
      }>
        {!role || !user ? (
          <LoginPage onLogin={handleLogin} />
        ) : role === "admin" ? (
          <AdminDashboard user={user} onLogout={handleLogout} />
        ) : (
          <VendorDashboard user={user} onLogout={handleLogout} />
        )}
      </Suspense>
    </QueryClientProvider>
  );
};

export default App;
