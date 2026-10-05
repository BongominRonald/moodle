import React from "react";
import {
  Store, LogOut, Menu, X, Bell, User, ChevronRight
} from "lucide-react";

interface DashboardLayoutProps {
  user: { name: string; email: string; id: string };
  role: "admin" | "vendor";
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  navItems: { id: string; label: string; icon: React.ElementType; badge?: number }[];
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user, role, activeTab, onTabChange, onLogout, navItems, children
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const activeItem = navItems.find(n => n.id === activeTab);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--gradient-sidebar)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">MVMS</p>
              <p className="text-white/50 text-xs">Mbarara City</p>
            </div>
          </div>
          <button
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.name}</p>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium"
                style={{
                  background: role === "admin" ? "hsl(var(--accent) / 0.25)" : "hsl(152 50% 40% / 0.4)",
                  color: role === "admin" ? "hsl(var(--accent))" : "hsl(142 60% 70%)"
                }}
              >
                {role === "admin" ? "Administrator" : "Vendor"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); setSidebarOpen(false); }}
              className={`nav-item w-full text-left ${activeTab === item.id ? "active" : ""}`}
            >
              <item.icon size={17} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center"
                  style={{ background: "hsl(var(--destructive))", color: "white" }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={onLogout}
            className="nav-item w-full text-left hover:bg-red-500/20"
            style={{ color: "hsl(0 80% 75%)" }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-5 py-3.5 border-b bg-card flex-shrink-0"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {role === "admin" ? "Admin Dashboard" : "Vendor Dashboard"}
              </span>
              {activeItem && (
                <>
                  <ChevronRight size={14} />
                  <span>{activeItem.label}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Bell size={18} />
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ background: "hsl(var(--destructive))" }}
              >
                3
              </span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: "hsl(var(--primary))", color: "white" }}
              >
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-foreground leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.id}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
