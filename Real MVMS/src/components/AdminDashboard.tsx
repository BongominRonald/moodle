import React, { useState } from "react";
import {
  LayoutDashboard, Users, Store, CreditCard, FileText,
  Megaphone, ShieldAlert, CheckCircle, Clock, TrendingUp,
  Plus, Search, Edit, Trash2, Eye, X, Check, AlertTriangle,
  Download, Printer, Building, XCircle, UserCheck, Bell
} from "lucide-react";

/* ─── Types ─── */
interface Vendor {
  id: string; name: string; email: string; phone: string;
  businessName: string; businessType: string; status: "pending" | "approved" | "rejected";
  stallNo?: string; registrationDate: string; idNumber: string;
  license: string; compliance: "compliant" | "noncompliant" | "expiring";
  rejectionReason?: string;
}
interface Stall {
  id: string; number: string; location: string; size: string;
  dailyRate: number; status: "available" | "occupied" | "maintenance";
  vendor?: string; section: string;
}
interface Payment {
  id: string; vendorName: string; stallNo: string; amount: number;
  date: string; method: string; status: "verified" | "pending" | "failed";
  bookingId: string; days: number;
}
interface Announcement {
  id: string; title: string; content: string; date: string;
  type: "notice" | "closure" | "event" | "rule"; author: string;
}

/* ─── Initial Data ─── */
const INIT_VENDORS: Vendor[] = [
  { id: "VND001", name: "Sarah Nakato", email: "sarah@gmail.com", phone: "0771234567", businessName: "Nakato Fresh Produce", businessType: "Vegetables & Fruits", status: "approved", stallNo: "A-12", registrationDate: "2024-01-15", idNumber: "CM90020001234A", license: "BL-2024-001", compliance: "compliant" },
  { id: "VND002", name: "Robert Tumwine", email: "robert@gmail.com", phone: "0782345678", businessName: "Tumwine Electronics", businessType: "Electronics", status: "pending", registrationDate: "2025-03-01", idNumber: "CM90020005678B", license: "BL-2024-002", compliance: "expiring" },
  { id: "VND003", name: "Grace Asiimwe", email: "grace@gmail.com", phone: "0753456789", businessName: "Grace Clothing", businessType: "Clothing & Textiles", status: "approved", stallNo: "B-07", registrationDate: "2023-11-20", idNumber: "CM90020009012C", license: "BL-2023-003", compliance: "noncompliant" },
  { id: "VND004", name: "Moses Byamugisha", email: "moses@gmail.com", phone: "0764567890", businessName: "Moses Hardware", businessType: "Hardware & Tools", status: "approved", stallNo: "C-03", registrationDate: "2024-03-10", idNumber: "CM90020003456D", license: "BL-2024-004", compliance: "compliant" },
  { id: "VND005", name: "Beatrice Kemigisha", email: "beatrice@gmail.com", phone: "0775678901", businessName: "Kemigisha Bakery", businessType: "Food & Beverages", status: "rejected", registrationDate: "2025-02-14", idNumber: "CM90020007890E", license: "BL-2025-005", compliance: "noncompliant", rejectionReason: "Incomplete health certificate submitted." },
  { id: "VND006", name: "Emmanuel Turyamureeba", email: "emma@gmail.com", phone: "0786789012", businessName: "Turyamureeba Crafts", businessType: "Crafts & Artwork", status: "pending", registrationDate: "2025-03-10", idNumber: "CM90020002345F", license: "BL-2025-006", compliance: "compliant" },
];
const INIT_STALLS: Stall[] = [
  { id: "S01", number: "A-01", location: "Main Block, Row A", size: "3x4m", dailyRate: 15000, status: "available", section: "Block A" },
  { id: "S02", number: "A-12", location: "Main Block, Row A", size: "3x4m", dailyRate: 15000, status: "occupied", vendor: "Sarah Nakato", section: "Block A" },
  { id: "S03", number: "B-07", location: "East Wing, Row B", size: "4x5m", dailyRate: 20000, status: "occupied", vendor: "Grace Asiimwe", section: "Block B" },
  { id: "S04", number: "B-15", location: "East Wing, Row B", size: "4x5m", dailyRate: 20000, status: "available", section: "Block B" },
  { id: "S05", number: "C-03", location: "West Wing, Row C", size: "5x6m", dailyRate: 25000, status: "occupied", vendor: "Moses Byamugisha", section: "Block C" },
  { id: "S06", number: "C-08", location: "West Wing, Row C", size: "3x4m", dailyRate: 15000, status: "maintenance", section: "Block C" },
  { id: "S07", number: "D-01", location: "North Block, Row D", size: "6x8m", dailyRate: 35000, status: "available", section: "Block D" },
  { id: "S08", number: "D-09", location: "North Block, Row D", size: "4x5m", dailyRate: 20000, status: "available", section: "Block D" },
];
const INIT_PAYMENTS: Payment[] = [
  { id: "PAY001", vendorName: "Sarah Nakato", stallNo: "A-12", amount: 450000, date: "2025-03-01", method: "MTN Mobile Money", status: "verified", bookingId: "BK001", days: 30 },
  { id: "PAY002", vendorName: "Moses Byamugisha", stallNo: "C-03", amount: 750000, date: "2025-03-05", method: "Airtel Money", status: "verified", bookingId: "BK002", days: 30 },
  { id: "PAY003", vendorName: "Grace Asiimwe", stallNo: "B-07", amount: 200000, date: "2025-03-10", method: "Bank Transfer", status: "pending", bookingId: "BK003", days: 10 },
  { id: "PAY004", vendorName: "Robert Tumwine", stallNo: "A-05", amount: 75000, date: "2025-03-12", method: "MTN Mobile Money", status: "pending", bookingId: "BK004", days: 5 },
  { id: "PAY005", vendorName: "Sarah Nakato", stallNo: "A-12", amount: 300000, date: "2025-02-01", method: "Cash", status: "verified", bookingId: "BK005", days: 20 },
];
const INIT_ANNOUNCEMENTS: Announcement[] = [
  { id: "ANN001", title: "Market Closure — Good Friday", content: "The market will be closed on 18th April 2025 in observance of Good Friday. All vendors are advised to plan accordingly. The market will resume normal operations on Saturday 19th April.", date: "2025-03-15", type: "closure", author: "Market Administrator" },
  { id: "ANN002", title: "New Sanitation Rules Effective April 2025", content: "All vendors must maintain clean stalls at all times. Garbage must be disposed in the designated collection points. Failure to comply will attract a fine of UGX 10,000 per day.", date: "2025-03-10", type: "rule", author: "Market Administrator" },
  { id: "ANN003", title: "Annual Market Day — April 30th 2025", content: "We are pleased to announce our Annual Market Day on April 30th. Special activities, entertainment, and discounts for customers. All vendors are encouraged to participate.", date: "2025-03-08", type: "event", author: "Market Administrator" },
];

/* ─── Helpers ─── */
const fmtUGX = (n: number) => `UGX ${n.toLocaleString()}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });

/* ─── Toast ─── */
interface ToastItem { id: number; msg: string; type: "success" | "error" | "info" }
const ToastContainer = ({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) => (
  <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-xs w-full">
    {toasts.map(t => (
      <div key={t.id} className={`flex items-start gap-3 p-4 rounded-xl shadow-lg text-sm font-medium animate-fade-in border
        ${t.type === "success" ? "bg-success/10 border-success/30 text-success" :
          t.type === "error" ? "bg-destructive/10 border-destructive/30 text-destructive" :
          "bg-info/10 border-info/30 text-info"}`}>
        {t.type === "success" ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" /> :
         t.type === "error" ? <XCircle size={16} className="flex-shrink-0 mt-0.5" /> :
         <Bell size={16} className="flex-shrink-0 mt-0.5" />}
        <span className="flex-1">{t.msg}</span>
        <button onClick={() => onDismiss(t.id)} className="opacity-60 hover:opacity-100"><X size={14} /></button>
      </div>
    ))}
  </div>
);

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toast = (msg: string, type: ToastItem["type"] = "success") => {
    const id = Date.now();
    setToasts(ts => [...ts, { id, msg, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3500);
  };
  const dismiss = (id: number) => setToasts(ts => ts.filter(t => t.id !== id));
  return { toasts, toast, dismiss };
}

/* ─── Sub-components ─── */
const StatCard = ({
  icon: Icon, label, value, color, sub
}: { icon: React.ElementType; label: string; value: string | number; color: string; sub?: string }) => (
  <div className="stat-card bg-card border flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ─── Modal ─── */
const Modal = ({
  title, onClose, children, wide
}: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className={`bg-card rounded-2xl w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto ${wide ? "max-w-2xl" : "max-w-lg"}`}>
      <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-card z-10">
        <h3 className="font-bold text-foreground">{title}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
          <X size={18} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

/* ─── Confirm Dialog ─── */
const ConfirmDialog = ({
  message, onConfirm, onCancel, confirmLabel = "Confirm", danger = false
}: { message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; danger?: boolean }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in p-6">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? "bg-destructive/10" : "bg-warning/10"}`}>
        <AlertTriangle size={24} className={danger ? "text-destructive" : "text-warning"} />
      </div>
      <p className="text-center font-medium text-foreground mb-6">{message}</p>
      <div className="flex gap-3">
        <button className="btn-outline flex-1" onClick={onCancel}>Cancel</button>
        <button className={`flex-1 ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

/* ─── Receipt Print Modal ─── */
const ReceiptModal = ({ payment, onClose }: { payment: Payment; onClose: () => void }) => (
  <Modal title="Payment Receipt" onClose={onClose}>
    <div id="receipt-content" className="space-y-4">
      <div className="text-center border-b pb-4">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-2">
          <Store size={28} className="text-primary" />
        </div>
        <h2 className="font-bold text-xl text-foreground">MBARARA CITY MARKET</h2>
        <p className="text-sm text-muted-foreground">Market Vendor Management System</p>
        <div className="mt-2 inline-block bg-success/10 border border-success/30 text-success px-4 py-1 rounded-full text-sm font-bold">
          OFFICIAL RECEIPT
        </div>
      </div>
      <div className="space-y-2 text-sm">
        {[
          ["Receipt / Payment ID", payment.id],
          ["Booking ID", payment.bookingId],
          ["Date & Time", fmtDate(payment.date)],
          ["Vendor Name", payment.vendorName],
          ["Stall Number", payment.stallNo],
          ["Days Booked", `${payment.days} days`],
          ["Payment Method", payment.method],
          ["Payment Status", payment.status.toUpperCase()],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between items-center py-2 border-b border-dashed border-border">
            <span className="text-muted-foreground">{l}</span>
            <span className="font-semibold text-foreground">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center p-4 rounded-xl bg-success/10 border border-success/30">
        <span className="font-bold text-lg text-foreground">TOTAL PAID</span>
        <span className="font-bold text-2xl text-success">{fmtUGX(payment.amount)}</span>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Thank you for your payment. This is an official receipt. Keep for your records.<br />
        Mbarara City Market Authority — © 2025
      </p>
    </div>
    <div className="flex gap-3 mt-4 pt-4 border-t">
      <button className="btn-outline flex-1" onClick={() => window.print()}>
        <Printer size={15} /> Print
      </button>
      <button className="btn-primary flex-1" onClick={onClose}>
        <Check size={15} /> Done
      </button>
    </div>
  </Modal>
);

/* ─── ADMIN OVERVIEW ─── */
const AdminOverview = ({ vendors, setVendors, payments, onTabChange, toast }: {
  vendors: Vendor[]; setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  payments: Payment[]; onTabChange: (t: string) => void; toast: (m: string, t?: ToastItem["type"]) => void;
}) => {
  const [rejReason, setRejReason] = useState("");
  const [showReject, setShowReject] = useState<Vendor | null>(null);
  const [receiptView, setReceiptView] = useState<Payment | null>(null);

  const approved = vendors.filter(v => v.status === "approved").length;
  const pending = vendors.filter(v => v.status === "pending").length;
  const totalRevenue = payments.filter(p => p.status === "verified").reduce((s, p) => s + p.amount, 0);
  const occupied = INIT_STALLS.filter(s => s.status === "occupied").length;

  const approve = (id: string) => {
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "approved" } : v));
    toast("Vendor application approved! Login credentials sent to vendor.", "success");
  };
  const reject = (v: Vendor) => {
    if (!rejReason.trim()) return;
    setVendors(vs => vs.map(x => x.id === v.id ? { ...x, status: "rejected", rejectionReason: rejReason } : x));
    setShowReject(null);
    setRejReason("");
    toast(`Application rejected. Notification sent to ${v.name}.`, "error");
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground">Mbarara City Market — Real-time summary</p>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
          {new Date().toLocaleDateString("en-UG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Vendors" value={approved} color="bg-primary" sub={`${pending} pending approval`} />
        <StatCard icon={Store} label="Stalls Occupied" value={`${occupied}/${INIT_STALLS.length}`} color="bg-info" sub="Across all blocks" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`UGX ${(totalRevenue / 1000000).toFixed(1)}M`} color="bg-success" sub="Verified payments" />
        <StatCard icon={ShieldAlert} label="Non-Compliant" value={vendors.filter(v => v.compliance === "noncompliant").length} color="bg-destructive" sub="Documents expired" />
      </div>

      {/* Pending approvals */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Clock size={18} className="text-warning" />
            Pending Vendor Approvals ({vendors.filter(v => v.status === "pending").length})
          </h3>
          <button onClick={() => onTabChange("vendors")} className="text-xs text-primary hover:underline font-medium">
            View All Vendors →
          </button>
        </div>
        <div className="space-y-3">
          {vendors.filter(v => v.status === "pending").map(v => (
            <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-sm text-foreground">{v.name}</p>
                <p className="text-xs text-muted-foreground">{v.businessName} · {v.businessType}</p>
                <p className="text-xs text-muted-foreground">Applied: {fmtDate(v.registrationDate)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(v.id)} className="btn-primary py-1.5 px-3 text-xs">
                  <Check size={13} /> Approve
                </button>
                <button onClick={() => setShowReject(v)} className="btn-danger py-1.5 px-3 text-xs">
                  <X size={13} /> Reject
                </button>
              </div>
            </div>
          ))}
          {vendors.filter(v => v.status === "pending").length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-success" /> All applications have been reviewed
            </p>
          )}
        </div>
      </div>

      {/* Recent payments */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <CreditCard size={18} className="text-info" /> Recent Payments
          </h3>
          <button onClick={() => onTabChange("payments")} className="text-xs text-primary hover:underline font-medium">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-xs uppercase">Vendor</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-xs uppercase">Stall</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-xs uppercase">Amount</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-xs uppercase hidden sm:table-cell">Method</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-xs uppercase">Status</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-xs uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 4).map(p => (
                <tr key={p.id} className="table-row-hover border-b border-border/50">
                  <td className="py-3 px-3 font-medium">{p.vendorName}</td>
                  <td className="py-3 px-3 text-muted-foreground">{p.stallNo}</td>
                  <td className="py-3 px-3 font-semibold text-primary">{fmtUGX(p.amount)}</td>
                  <td className="py-3 px-3 text-muted-foreground hidden sm:table-cell text-xs">{p.method}</td>
                  <td className="py-3 px-3">
                    <span className={p.status === "verified" ? "badge-success" : p.status === "pending" ? "badge-warning" : "badge-danger"}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button onClick={() => setReceiptView(p)} className="text-xs text-primary hover:underline font-medium">View Receipt</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Non-compliant vendors quick list */}
      {vendors.filter(v => v.compliance === "noncompliant" && v.status === "approved").length > 0 && (
        <div className="section-card border-l-4" style={{ borderLeftColor: "hsl(var(--destructive))" }}>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <ShieldAlert size={18} className="text-destructive" /> Non-Compliant Vendors Alert
          </h3>
          <div className="space-y-2">
            {vendors.filter(v => v.compliance === "noncompliant" && v.status === "approved").map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm">
                <div>
                  <span className="font-semibold text-foreground">{v.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">· {v.businessName}</span>
                </div>
                <button onClick={() => onTabChange("compliance")} className="text-xs text-destructive hover:underline font-medium">
                  Review →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReject && (
        <Modal title="Reject Vendor Application" onClose={() => { setShowReject(null); setRejReason(""); }}>
          <p className="text-sm text-muted-foreground mb-4">
            Provide a reason for rejecting <strong className="text-foreground">{showReject.name}</strong>'s application. This will be sent to the vendor.
          </p>
          <textarea
            className="form-input min-h-[100px] resize-none"
            placeholder="Enter reason for rejection…"
            value={rejReason}
            onChange={e => setRejReason(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <button className="btn-outline flex-1" onClick={() => { setShowReject(null); setRejReason(""); }}>Cancel</button>
            <button className="btn-danger flex-1" onClick={() => reject(showReject)} disabled={!rejReason.trim()}>
              <XCircle size={15} /> Reject Application
            </button>
          </div>
        </Modal>
      )}

      {receiptView && <ReceiptModal payment={receiptView} onClose={() => setReceiptView(null)} />}
    </div>
  );
};

/* ─── VENDOR MANAGEMENT ─── */
const VendorManagement = ({ vendors, setVendors, stalls, toast }: {
  vendors: Vendor[]; setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  stalls: Stall[]; toast: (m: string, t?: ToastItem["type"]) => void;
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vendor>>({});
  const [rejReason, setRejReason] = useState("");
  const [showReject, setShowReject] = useState<Vendor | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Vendor | null>(null);
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", businessName: "", businessType: "Vegetables & Fruits", idNumber: "" });

  const filtered = vendors.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = v.name.toLowerCase().includes(q) || v.businessName.toLowerCase().includes(q) || v.id.toLowerCase().includes(q);
    const matchFilter = filter === "all" || v.status === filter;
    return matchSearch && matchFilter;
  });

  const approve = (id: string) => {
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "approved" } : v));
    toast("Vendor approved! Login credentials sent via email.", "success");
  };
  const reject = (v: Vendor) => {
    if (!rejReason.trim()) return;
    setVendors(vs => vs.map(x => x.id === v.id ? { ...x, status: "rejected", rejectionReason: rejReason } : x));
    setShowReject(null); setRejReason("");
    toast(`${v.name}'s application rejected. Vendor notified.`, "error");
  };
  const deleteVendor = (v: Vendor) => {
    setVendors(vs => vs.filter(x => x.id !== v.id));
    setDeleteConfirm(null);
    toast(`Vendor ${v.name} removed from system.`, "info");
  };
  const startEdit = (v: Vendor) => { setEditing(v); setEditForm({ phone: v.phone, email: v.email, businessName: v.businessName, businessType: v.businessType, stallNo: v.stallNo, compliance: v.compliance }); };
  const saveEdit = () => {
    if (!editing) return;
    setVendors(vs => vs.map(v => v.id === editing.id ? { ...v, ...editForm } : v));
    setEditing(null); setEditForm({});
    toast("Vendor details updated successfully.", "success");
  };
  const addVendor = () => {
    const id = `VND${(vendors.length + 1).toString().padStart(3, "0")}`;
    const newVendor: Vendor = { ...addForm, id, status: "pending", registrationDate: new Date().toISOString().split("T")[0], license: `BL-2025-${id}`, compliance: "compliant" };
    setVendors(vs => [newVendor, ...vs]);
    setShowAdd(false);
    setAddForm({ name: "", email: "", phone: "", businessName: "", businessType: "Vegetables & Fruits", idNumber: "" });
    toast(`Vendor ${addForm.name} added successfully. Pending approval.`, "success");
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="page-title">Vendor Management</h2>
          <p className="text-sm text-muted-foreground">Manage and approve vendor registrations</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["all", "approved", "pending", "rejected"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`p-3 rounded-xl border text-left transition-all ${filter === s ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
            <p className="text-lg font-bold text-foreground">{s === "all" ? vendors.length : vendors.filter(v => v.status === s).length}</p>
            <p className="text-xs text-muted-foreground capitalize">{s === "all" ? "All Vendors" : s}</p>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input className="form-input pl-9" placeholder="Search by name, business, or ID…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="section-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Vendor</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase hidden md:table-cell">Business</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase hidden sm:table-cell">Stall</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Status</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase hidden lg:table-cell">Compliance</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="table-row-hover border-b border-border/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center font-bold text-xs text-primary flex-shrink-0">
                      {v.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <p className="font-medium text-foreground">{v.businessName}</p>
                  <p className="text-xs text-muted-foreground">{v.businessType}</p>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <span className="font-mono text-sm font-bold text-primary">{v.stallNo || "—"}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={v.status === "approved" ? "badge-success" : v.status === "pending" ? "badge-warning" : "badge-danger"}>
                    {v.status}
                  </span>
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  <span className={v.compliance === "compliant" ? "badge-success" : v.compliance === "expiring" ? "badge-warning" : "badge-danger"}>
                    {v.compliance}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setSelected(v)} className="p-1.5 rounded-lg text-muted-foreground hover:text-info hover:bg-info/10 transition-colors" title="View Details">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => startEdit(v)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                      <Edit size={15} />
                    </button>
                    {v.status === "pending" && (
                      <>
                        <button onClick={() => approve(v.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-success hover:bg-success/10 transition-colors" title="Approve">
                          <UserCheck size={15} />
                        </button>
                        <button onClick={() => setShowReject(v)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Reject">
                          <XCircle size={15} />
                        </button>
                      </>
                    )}
                    <button onClick={() => setDeleteConfirm(v)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No vendors found</p>}
      </div>

      {/* View Detail Modal */}
      {selected && (
        <Modal title={`Vendor Details — ${selected.id}`} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center font-bold text-2xl text-primary">
                {selected.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-lg text-foreground">{selected.name}</h4>
                <p className="text-sm text-muted-foreground">{selected.businessName}</p>
                <div className="flex gap-2 mt-1">
                  <span className={selected.status === "approved" ? "badge-success" : selected.status === "pending" ? "badge-warning" : "badge-danger"}>{selected.status}</span>
                  <span className={selected.compliance === "compliant" ? "badge-success" : selected.compliance === "expiring" ? "badge-warning" : "badge-danger"}>{selected.compliance}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Vendor ID", selected.id], ["National ID", selected.idNumber],
                ["Phone", selected.phone], ["Email", selected.email],
                ["Business Type", selected.businessType], ["License No.", selected.license],
                ["Stall Assigned", selected.stallNo || "Not allocated"],
                ["Registered", fmtDate(selected.registrationDate)],
              ].map(([l, v]) => (
                <div key={l} className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground font-medium">{l}</p>
                  <p className="font-semibold text-foreground">{v}</p>
                </div>
              ))}
            </div>
            {selected.rejectionReason && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
                <p className="font-semibold text-destructive mb-1">Rejection Reason:</p>
                <p className="text-muted-foreground">{selected.rejectionReason}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button className="btn-outline flex-1" onClick={() => { setSelected(null); startEdit(selected); }}>
                <Edit size={15} /> Edit Details
              </button>
              <button className="btn-primary flex-1" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editing && (
        <Modal title={`Edit Vendor — ${editing.name}`} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={editForm.phone || ""} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={editForm.email || ""} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Business Name</label>
                <input className="form-input" value={editForm.businessName || ""} onChange={e => setEditForm(p => ({ ...p, businessName: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Business Type</label>
                <select className="form-input" value={editForm.businessType || ""} onChange={e => setEditForm(p => ({ ...p, businessType: e.target.value }))}>
                  {["Vegetables & Fruits", "Electronics", "Clothing & Textiles", "Food & Beverages", "Hardware & Tools", "Crafts & Artwork"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Assign Stall</label>
                <select className="form-input" value={editForm.stallNo || ""} onChange={e => setEditForm(p => ({ ...p, stallNo: e.target.value || undefined }))}>
                  <option value="">— No Stall —</option>
                  {stalls.filter(s => s.status === "available" || s.vendor === editing.name).map(s => (
                    <option key={s.id} value={s.number}>{s.number} — {s.section} ({s.size})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Compliance Status</label>
                <select className="form-input" value={editForm.compliance || ""} onChange={e => setEditForm(p => ({ ...p, compliance: e.target.value as Vendor["compliance"] }))}>
                  <option value="compliant">Compliant</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="noncompliant">Non-Compliant</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Vendor Modal */}
      {showAdd && (
        <Modal title="Add New Vendor" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="e.g. Jane Nantale" value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">National ID *</label>
                <input className="form-input" placeholder="e.g. CM900200..." value={addForm.idNumber} onChange={e => setAddForm(p => ({ ...p, idNumber: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Phone *</label>
                <input className="form-input" placeholder="07XXXXXXXX" value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="vendor@email.com" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Business Name *</label>
                <input className="form-input" placeholder="Business name" value={addForm.businessName} onChange={e => setAddForm(p => ({ ...p, businessName: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Business Type</label>
                <select className="form-input" value={addForm.businessType} onChange={e => setAddForm(p => ({ ...p, businessType: e.target.value }))}>
                  {["Vegetables & Fruits", "Electronics", "Clothing & Textiles", "Food & Beverages", "Hardware & Tools", "Crafts & Artwork"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={addVendor} disabled={!addForm.name || !addForm.email || !addForm.phone || !addForm.businessName}>
                <Plus size={15} /> Add Vendor
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmDialog
          message={`Are you sure you want to remove ${deleteConfirm.name} (${deleteConfirm.businessName}) from the system? This action cannot be undone.`}
          confirmLabel="Delete Vendor"
          danger
          onConfirm={() => deleteVendor(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Reject Modal */}
      {showReject && (
        <Modal title="Reject Vendor Application" onClose={() => { setShowReject(null); setRejReason(""); }}>
          <p className="text-sm text-muted-foreground mb-4">
            Provide a reason for rejecting <strong className="text-foreground">{showReject.name}</strong>'s application.
          </p>
          <textarea
            className="form-input min-h-[100px] resize-none"
            placeholder="Enter reason for rejection…"
            value={rejReason}
            onChange={e => setRejReason(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <button className="btn-outline flex-1" onClick={() => { setShowReject(null); setRejReason(""); }}>Cancel</button>
            <button className="btn-danger flex-1" onClick={() => reject(showReject)} disabled={!rejReason.trim()}>
              Reject Application
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ─── STALL MANAGEMENT ─── */
const StallManagement = ({ stalls, setStalls, vendors, toast }: {
  stalls: Stall[]; setStalls: React.Dispatch<React.SetStateAction<Stall[]>>;
  vendors: Vendor[]; toast: (m: string, t?: ToastItem["type"]) => void;
}) => {
  const [filter, setFilter] = useState<"all" | "available" | "occupied" | "maintenance">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Stall | null>(null);
  const [editForm, setEditForm] = useState<Partial<Stall & { dailyRateStr: string }>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<Stall | null>(null);
  const [newStall, setNewStall] = useState({ number: "", location: "", size: "3x4m", dailyRate: "15000", section: "Block A" });

  const filtered = stalls.filter(s => filter === "all" || s.status === filter);
  const statusColor = { available: "badge-success", occupied: "badge-info", maintenance: "badge-warning" } as const;

  const addStall = () => {
    const id = `S${(stalls.length + 1).toString().padStart(2, "0")}`;
    setStalls(prev => [...prev, { ...newStall, id, dailyRate: +newStall.dailyRate, status: "available" as const }]);
    setShowAdd(false);
    setNewStall({ number: "", location: "", size: "3x4m", dailyRate: "15000", section: "Block A" });
    toast(`Stall ${newStall.number} added successfully.`, "success");
  };
  const startEdit = (s: Stall) => {
    setEditing(s);
    setEditForm({ number: s.number, location: s.location, size: s.size, dailyRateStr: String(s.dailyRate), section: s.section, status: s.status, vendor: s.vendor });
  };
  const saveEdit = () => {
    if (!editing) return;
    setStalls(ss => ss.map(s => s.id === editing.id ? {
      ...s, ...editForm,
      dailyRate: Number(editForm.dailyRateStr) || s.dailyRate,
      vendor: editForm.status === "available" ? undefined : editForm.vendor,
    } : s));
    setEditing(null); setEditForm({});
    toast("Stall details updated.", "success");
  };
  const deleteStall = (s: Stall) => {
    if (s.status === "occupied") { toast("Cannot delete an occupied stall. Unassign vendor first.", "error"); setDeleteConfirm(null); return; }
    setStalls(ss => ss.filter(x => x.id !== s.id));
    setDeleteConfirm(null);
    toast(`Stall ${s.number} removed.`, "info");
  };
  const toggleMaintenance = (s: Stall) => {
    const newStatus = s.status === "maintenance" ? "available" : "maintenance";
    setStalls(ss => ss.map(x => x.id === s.id ? { ...x, status: newStatus } : x));
    toast(`Stall ${s.number} set to ${newStatus}.`, "info");
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="page-title">Stall Management</h2>
          <p className="text-sm text-muted-foreground">Manage market stalls and availability</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Stall
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "available", "occupied", "maintenance"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === "all" ? stalls.length : stalls.filter(s => s.status === f).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="section-card hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-xl text-foreground">{s.number}</p>
                <p className="text-xs text-muted-foreground">{s.section}</p>
              </div>
              <span className={statusColor[s.status]}>{s.status}</span>
            </div>
            <div className="space-y-1.5 text-xs mb-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">{s.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size</span>
                <span className="font-medium">{s.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Rate</span>
                <span className="font-bold text-primary">{fmtUGX(s.dailyRate)}</span>
              </div>
              {s.vendor && (
                <div className="flex justify-between border-t border-border/50 pt-1.5">
                  <span className="text-muted-foreground">Vendor</span>
                  <span className="font-medium text-foreground">{s.vendor}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-3 border-t border-border">
              <button onClick={() => startEdit(s)} className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
                <Edit size={11} /> Edit
              </button>
              <button onClick={() => toggleMaintenance(s)} className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-warning/40 text-warning hover:bg-warning/10 transition-colors flex items-center justify-center gap-1">
                {s.status === "maintenance" ? <Check size={11} /> : <AlertTriangle size={11} />}
                {s.status === "maintenance" ? "Activate" : "Maintain"}
              </button>
              <button onClick={() => setDeleteConfirm(s)} className="py-1.5 px-2 rounded-lg text-xs border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Stall Modal */}
      {showAdd && (
        <Modal title="Add New Stall" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Stall Number *</label>
                <input className="form-input" placeholder="e.g. A-20" value={newStall.number} onChange={e => setNewStall(p => ({ ...p, number: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Section</label>
                <select className="form-input" value={newStall.section} onChange={e => setNewStall(p => ({ ...p, section: e.target.value }))}>
                  {["Block A", "Block B", "Block C", "Block D"].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Size</label>
                <select className="form-input" value={newStall.size} onChange={e => setNewStall(p => ({ ...p, size: e.target.value }))}>
                  {["3x4m", "4x5m", "5x6m", "6x8m"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Daily Rate (UGX) *</label>
                <input className="form-input" type="number" value={newStall.dailyRate} onChange={e => setNewStall(p => ({ ...p, dailyRate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="form-label">Location Description *</label>
              <input className="form-input" placeholder="e.g. Main Block, Row A" value={newStall.location} onChange={e => setNewStall(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={addStall} disabled={!newStall.number || !newStall.location}>
                <Plus size={15} /> Add Stall
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Stall Modal */}
      {editing && (
        <Modal title={`Edit Stall ${editing.number}`} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Stall Number</label>
                <input className="form-input" value={editForm.number || ""} onChange={e => setEditForm(p => ({ ...p, number: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Section</label>
                <select className="form-input" value={editForm.section || ""} onChange={e => setEditForm(p => ({ ...p, section: e.target.value }))}>
                  {["Block A", "Block B", "Block C", "Block D"].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Size</label>
                <select className="form-input" value={editForm.size || ""} onChange={e => setEditForm(p => ({ ...p, size: e.target.value }))}>
                  {["3x4m", "4x5m", "5x6m", "6x8m"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Daily Rate (UGX)</label>
                <input className="form-input" type="number" value={editForm.dailyRateStr || ""} onChange={e => setEditForm(p => ({ ...p, dailyRateStr: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={editForm.status || ""} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as Stall["status"] }))}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="form-label">Assigned Vendor</label>
                <select className="form-input" value={editForm.vendor || ""} onChange={e => setEditForm(p => ({ ...p, vendor: e.target.value || undefined }))}>
                  <option value="">— None —</option>
                  {vendors.filter(v => v.status === "approved").map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Location Description</label>
              <input className="form-input" value={editForm.location || ""} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          message={`Remove stall ${deleteConfirm.number} (${deleteConfirm.section})? ${deleteConfirm.status === "occupied" ? "⚠️ This stall is currently occupied!" : ""}`}
          confirmLabel="Delete Stall" danger
          onConfirm={() => deleteStall(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

/* ─── PAYMENT MANAGEMENT ─── */
const PaymentManagement = ({ payments, setPayments, toast }: {
  payments: Payment[]; setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  toast: (m: string, t?: ToastItem["type"]) => void;
}) => {
  const [search, setSearch] = useState("");
  const [receiptView, setReceiptView] = useState<Payment | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending" | "failed">("all");

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.vendorName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.stallNo.toLowerCase().includes(q);
    const matchFilter = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const verify = (id: string) => {
    setPayments(ps => ps.map(p => p.id === id ? { ...p, status: "verified" as const } : p));
    toast("Payment verified successfully!", "success");
  };
  const reject = (id: string) => {
    setPayments(ps => ps.map(p => p.id === id ? { ...p, status: "failed" as const } : p));
    toast("Payment marked as failed.", "error");
  };

  const totalVerified = payments.filter(p => p.status === "verified").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="page-title">Payment Management</h2>
          <p className="text-sm text-muted-foreground">Track and verify vendor payments</p>
        </div>
        <button className="btn-outline" onClick={() => window.print()}>
          <Printer size={15} /> Print Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={CreditCard} label="Total Verified Revenue" value={fmtUGX(totalVerified)} color="bg-success" />
        <StatCard icon={Clock} label="Pending Verification" value={payments.filter(p => p.status === "pending").length} color="bg-warning" />
        <StatCard icon={CheckCircle} label="Verified Payments" value={payments.filter(p => p.status === "verified").length} color="bg-primary" />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "verified", "pending", "failed"] as const).map(f => (
          <button key={f} onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${filterStatus === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}>
            {f} ({f === "all" ? payments.length : payments.filter(p => p.status === f).length})
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input className="form-input pl-9" placeholder="Search by vendor name, payment ID, or stall…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="section-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Payment ID</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Vendor</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Stall</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Amount</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase hidden md:table-cell">Method</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase hidden sm:table-cell">Date</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Status</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="table-row-hover border-b border-border/50">
                <td className="py-3 px-4 font-mono text-xs font-bold text-primary">{p.id}</td>
                <td className="py-3 px-4 font-medium">{p.vendorName}</td>
                <td className="py-3 px-4 font-mono">{p.stallNo}</td>
                <td className="py-3 px-4 font-bold text-success">{fmtUGX(p.amount)}</td>
                <td className="py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">{p.method}</td>
                <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell text-xs">{fmtDate(p.date)}</td>
                <td className="py-3 px-4">
                  <span className={p.status === "verified" ? "badge-success" : p.status === "pending" ? "badge-warning" : "badge-danger"}>{p.status}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setReceiptView(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-info hover:bg-info/10 transition-colors" title="View Receipt">
                      <Eye size={15} />
                    </button>
                    {p.status === "pending" && (
                      <>
                        <button onClick={() => verify(p.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-success hover:bg-success/10 transition-colors" title="Verify Payment">
                          <CheckCircle size={15} />
                        </button>
                        <button onClick={() => reject(p.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Reject Payment">
                          <XCircle size={15} />
                        </button>
                      </>
                    )}
                    <button onClick={() => { setReceiptView(p); setTimeout(() => window.print(), 300); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Print Receipt">
                      <Printer size={15} />
                    </button>
                    <button onClick={() => setReceiptView(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Download">
                      <Download size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-muted-foreground text-sm">No payments found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {receiptView && <ReceiptModal payment={receiptView} onClose={() => setReceiptView(null)} />}
    </div>
  );
};

/* ─── FINANCIAL REPORTS ─── */
const FinancialReports = ({ payments, vendors }: { payments: Payment[]; vendors: Vendor[] }) => {
  const [reportType, setReportType] = useState<"daily" | "vendor" | "monthly">("daily");
  const totalRevenue = payments.filter(p => p.status === "verified").reduce((s, p) => s + p.amount, 0);
  const methodTotals = payments.filter(p => p.status === "verified").reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="page-title">Financial Reports</h2>
          <p className="text-sm text-muted-foreground">Revenue and payment analytics</p>
        </div>
        <button className="btn-primary" onClick={() => window.print()}>
          <Printer size={16} /> Print Report
        </button>
      </div>

      <div className="flex gap-2 border-b border-border pb-1 overflow-x-auto">
        {[{ id: "daily" as const, label: "Daily Revenue" }, { id: "vendor" as const, label: "Vendor Payments" }, { id: "monthly" as const, label: "Monthly Summary" }].map(t => (
          <button key={t.id} onClick={() => setReportType(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${reportType === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {reportType === "daily" && (
        <div className="space-y-5">
          <div className="section-card">
            <h3 className="font-bold mb-3 text-foreground">Daily Revenue Report — {fmtDate(new Date().toISOString().split("T")[0])}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Total Revenue", value: fmtUGX(totalRevenue), color: "text-success" },
                { label: "Verified Payments", value: payments.filter(p => p.status === "verified").length, color: "text-primary" },
                { label: "Pending", value: payments.filter(p => p.status === "pending").length, color: "text-warning" },
                { label: "Total Bookings", value: payments.length, color: "text-info" },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Revenue by Payment Method</h4>
            {Object.entries(methodTotals).map(([method, amount]) => (
              <div key={method} className="flex items-center justify-between py-2.5 border-b border-border/50 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{method}</span>
                </div>
                <span className="font-bold text-primary">{fmtUGX(amount)}</span>
              </div>
            ))}
          </div>
          <div className="section-card">
            <h4 className="font-semibold mb-3 text-foreground">All Verified Payments</h4>
            <div className="space-y-2">
              {payments.filter(p => p.status === "verified").map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-sm flex-wrap gap-2">
                  <div>
                    <span className="font-semibold">{p.vendorName}</span>
                    <span className="text-muted-foreground mx-2">·</span>
                    <span className="text-muted-foreground">Stall {p.stallNo} · {p.days} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{fmtDate(p.date)}</span>
                    <span className="font-bold text-success">{fmtUGX(p.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reportType === "vendor" && (
        <div className="section-card">
          <h3 className="font-bold mb-4 text-foreground">Vendor Payment History Report</h3>
          {vendors.filter(v => v.status === "approved").map(v => {
            const vPayments = payments.filter(p => p.vendorName === v.name);
            const total = vPayments.reduce((s, p) => s + p.amount, 0);
            return (
              <div key={v.id} className="mb-4 p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">{v.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-foreground">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.businessName} · Stall {v.stallNo || "N/A"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">{fmtUGX(total)}</p>
                    <p className="text-xs text-muted-foreground">{vPayments.length} payment(s)</p>
                  </div>
                </div>
                {vPayments.length > 0 ? (
                  <div className="space-y-1.5">
                    {vPayments.map(p => (
                      <div key={p.id} className="flex justify-between text-xs bg-muted/40 px-3 py-2 rounded-lg">
                        <span className="text-muted-foreground">{fmtDate(p.date)} · {p.method} · {p.stallNo}</span>
                        <div className="flex items-center gap-2">
                          <span className={p.status === "verified" ? "badge-success" : p.status === "pending" ? "badge-warning" : "badge-danger"}>{p.status}</span>
                          <span className="font-semibold">{fmtUGX(p.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No payments recorded</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reportType === "monthly" && (
        <div className="space-y-4">
          <div className="section-card">
            <h3 className="font-bold mb-4 text-foreground">Monthly Summary — March 2025</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Monthly Revenue", value: fmtUGX(totalRevenue), color: "text-success" },
                { label: "Total Bookings", value: payments.length, color: "text-primary" },
                { label: "Active Vendors", value: vendors.filter(v => v.status === "approved").length, color: "text-info" },
                { label: "Available Stalls", value: INIT_STALLS.filter(s => s.status === "available").length, color: "text-warning" },
                { label: "Avg. Daily Revenue", value: fmtUGX(Math.floor(totalRevenue / 30)), color: "text-foreground" },
                { label: "Non-Compliant", value: vendors.filter(v => v.compliance === "noncompliant").length, color: "text-destructive" },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl bg-muted/50 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="section-card">
            <h4 className="font-bold mb-3 text-foreground">Top Stalls by Bookings</h4>
            {INIT_STALLS.filter(s => s.status === "occupied").map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5 border-b border-border/50 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center">{i + 1}</span>
                <span className="font-mono font-bold text-primary">{s.number}</span>
                <span className="text-muted-foreground flex-1">{s.vendor}</span>
                <span className="font-bold">{fmtUGX(s.dailyRate)}/day</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── COMPLIANCE ─── */
const ComplianceTracking = ({ vendors, setVendors, toast }: {
  vendors: Vendor[]; setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  toast: (m: string, t?: ToastItem["type"]) => void;
}) => {
  const [selected, setSelected] = useState<Vendor | null>(null);

  const updateCompliance = (id: string, status: Vendor["compliance"]) => {
    setVendors(vs => vs.map(v => v.id === id ? { ...v, compliance: status } : v));
    setSelected(null);
    toast(`Compliance status updated to "${status}".`, status === "compliant" ? "success" : "info");
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="page-title">Compliance Tracking</h2>
          <p className="text-sm text-muted-foreground">Monitor vendor document compliance</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={CheckCircle} label="Compliant Vendors" value={vendors.filter(v => v.compliance === "compliant").length} color="bg-success" />
        <StatCard icon={AlertTriangle} label="Expiring Soon" value={vendors.filter(v => v.compliance === "expiring").length} color="bg-warning" />
        <StatCard icon={ShieldAlert} label="Non-Compliant" value={vendors.filter(v => v.compliance === "noncompliant").length} color="bg-destructive" />
      </div>
      <div className="section-card">
        <h3 className="font-bold mb-4 text-foreground">Vendor Compliance Status</h3>
        <div className="space-y-3">
          {vendors.filter(v => v.status === "approved").map(v => (
            <div key={v.id} className="flex items-center justify-between p-4 rounded-xl border border-border flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center font-bold text-sm text-primary">
                  {v.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.businessName} · {v.idNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={v.compliance === "compliant" ? "badge-success" : v.compliance === "expiring" ? "badge-warning" : "badge-danger"}>
                  {v.compliance}
                </span>
                <button onClick={() => setSelected(v)} className="btn-outline py-1.5 px-3 text-xs">
                  <Edit size={12} /> Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Non-compliant alert */}
      {vendors.filter(v => v.compliance === "noncompliant" && v.status === "approved").length > 0 && (
        <div className="section-card border border-destructive/30 bg-destructive/5">
          <h4 className="font-bold text-destructive mb-3 flex items-center gap-2">
            <ShieldAlert size={16} /> Non-Compliant Vendors — Action Required
          </h4>
          <p className="text-sm text-muted-foreground mb-3">These vendors have expired documents and are restricted from new bookings:</p>
          <div className="space-y-2">
            {vendors.filter(v => v.compliance === "noncompliant" && v.status === "approved").map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border text-sm">
                <div>
                  <span className="font-semibold text-foreground">{v.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">· {v.businessName}</span>
                </div>
                <button onClick={() => updateCompliance(v.id, "compliant")} className="btn-primary py-1 px-3 text-xs">
                  <CheckCircle size={12} /> Mark Compliant
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <Modal title={`Update Compliance — ${selected.name}`} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="font-semibold">{selected.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Business</span><span className="font-semibold">{selected.businessName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Current Status</span>
                <span className={selected.compliance === "compliant" ? "badge-success" : selected.compliance === "expiring" ? "badge-warning" : "badge-danger"}>
                  {selected.compliance}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Select new compliance status after reviewing the vendor's documents:</p>
            <div className="grid grid-cols-3 gap-3">
              {(["compliant", "expiring", "noncompliant"] as const).map(s => (
                <button key={s} onClick={() => updateCompliance(selected.id, s)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all capitalize
                    ${s === "compliant" ? "border-success text-success hover:bg-success/10" :
                      s === "expiring" ? "border-warning text-warning hover:bg-warning/10" :
                      "border-destructive text-destructive hover:bg-destructive/10"}`}>
                  {s === "compliant" ? <CheckCircle size={16} className="mx-auto mb-1" /> :
                   s === "expiring" ? <AlertTriangle size={16} className="mx-auto mb-1" /> :
                   <ShieldAlert size={16} className="mx-auto mb-1" />}
                  {s}
                </button>
              ))}
            </div>
            <button className="btn-outline w-full" onClick={() => setSelected(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ─── ANNOUNCEMENTS ─── */
const AdminAnnouncements = ({ toast }: { toast: (m: string, t?: ToastItem["type"]) => void }) => {
  const [announcements, setAnnouncements] = useState(INIT_ANNOUNCEMENTS);
  const [showNew, setShowNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: "", content: "", type: "notice" as Announcement["type"] });

  const create = () => {
    if (!form.title || !form.content) return;
    const id = `ANN${(announcements.length + 1).toString().padStart(3, "0")}`;
    setAnnouncements(prev => [{ ...form, id, date: new Date().toISOString().split("T")[0], author: "Market Administrator" }, ...prev]);
    setShowNew(false);
    setForm({ title: "", content: "", type: "notice" });
    toast("Announcement sent to all vendors!", "success");
  };
  const deleteAnn = (a: Announcement) => {
    setAnnouncements(as => as.filter(x => x.id !== a.id));
    setDeleteConfirm(null);
    toast("Announcement deleted.", "info");
  };

  const typeColors = { notice: "badge-info", closure: "badge-danger", event: "badge-success", rule: "badge-warning" } as const;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="page-title">Announcements</h2>
          <p className="text-sm text-muted-foreground">Send notices to all vendors</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map(a => (
          <div key={a.id} className="section-card">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Megaphone size={18} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground truncate">{a.title}</h4>
                  <p className="text-xs text-muted-foreground">{fmtDate(a.date)} · {a.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={typeColors[a.type]}>{a.type}</span>
                <button onClick={() => setDeleteConfirm(a)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-11">{a.content}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="section-card text-center py-10">
            <Megaphone size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">No announcements yet. Create one to notify all vendors.</p>
          </div>
        )}
      </div>

      {showNew && (
        <Modal title="Create New Announcement" onClose={() => setShowNew(false)}>
          <div className="space-y-4">
            <div>
              <label className="form-label">Announcement Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as Announcement["type"] }))}>
                {["notice", "closure", "event", "rule"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="Announcement title…" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Content *</label>
              <textarea className="form-input min-h-[120px] resize-none" placeholder="Write announcement content…" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={create} disabled={!form.title || !form.content}>
                <Megaphone size={15} /> Send to All Vendors
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          message={`Delete the announcement "${deleteConfirm.title}"? Vendors will no longer see this.`}
          confirmLabel="Delete" danger
          onConfirm={() => deleteAnn(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

/* ─── MAIN ADMIN DASHBOARD ─── */
const AdminDashboard = ({
  user, onLogout
}: { user: { name: string; email: string; id: string }; onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [vendors, setVendors] = useState<Vendor[]>(INIT_VENDORS);
  const [stalls, setStalls] = useState<Stall[]>(INIT_STALLS);
  const [payments, setPayments] = useState<Payment[]>(INIT_PAYMENTS);
  const { toasts, toast, dismiss } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "vendors", label: "Vendor Management", icon: Users, badge: vendors.filter(v => v.status === "pending").length },
    { id: "stalls", label: "Stall Management", icon: Building },
    { id: "payments", label: "Payments", icon: CreditCard, badge: payments.filter(p => p.status === "pending").length },
    { id: "compliance", label: "Compliance", icon: ShieldAlert, badge: vendors.filter(v => v.compliance === "noncompliant").length },
    { id: "reports", label: "Financial Reports", icon: FileText },
    { id: "announcements", label: "Announcements", icon: Megaphone },
  ];

  const DashboardLayout = React.lazy(() => import("./DashboardLayout"));

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading…</div>}>
        <DashboardLayout user={user} role="admin" activeTab={activeTab} onTabChange={setActiveTab}
          onLogout={() => setShowLogoutConfirm(true)} navItems={navItems}>
          {activeTab === "overview" && <AdminOverview vendors={vendors} setVendors={setVendors} payments={payments} onTabChange={setActiveTab} toast={toast} />}
          {activeTab === "vendors" && <VendorManagement vendors={vendors} setVendors={setVendors} stalls={stalls} toast={toast} />}
          {activeTab === "stalls" && <StallManagement stalls={stalls} setStalls={setStalls} vendors={vendors} toast={toast} />}
          {activeTab === "payments" && <PaymentManagement payments={payments} setPayments={setPayments} toast={toast} />}
          {activeTab === "compliance" && <ComplianceTracking vendors={vendors} setVendors={setVendors} toast={toast} />}
          {activeTab === "reports" && <FinancialReports payments={payments} vendors={vendors} />}
          {activeTab === "announcements" && <AdminAnnouncements toast={toast} />}
        </DashboardLayout>
      </React.Suspense>

      {showLogoutConfirm && (
        <ConfirmDialog
          message="Are you sure you want to log out of MVMS?"
          confirmLabel="Yes, Logout"
          danger
          onConfirm={onLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
};

export default AdminDashboard;
