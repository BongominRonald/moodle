import React, { useState } from "react";
import {
  LayoutDashboard, Store, CreditCard, FileText,
  Bell, User, ShieldAlert, CheckCircle,
  Search, Printer, X, MapPin,
  CalendarDays, Receipt, AlertTriangle,
  Megaphone, ChevronRight, Edit, Upload,
  XCircle, Download, Clock
} from "lucide-react";

/* ─── Types ─── */
interface Booking {
  id: string; stallNo: string; location: string; size: string;
  startDate: string; endDate: string; days: number; totalAmount: number;
  status: "confirmed" | "pending" | "cancelled"; paymentMethod: string;
  paymentId: string;
}
interface VendorPayment {
  id: string; bookingId: string; stallNo: string; amount: number;
  date: string; method: string; status: "paid" | "pending" | "failed";
  receiptNo: string;
}
interface DocRecord {
  name: string; number: string; expiry: string; status: "valid" | "expiring" | "expired";
}
interface AnnouncementItem {
  id: string; title: string; content: string; date: string;
  type: "notice" | "closure" | "event" | "rule"; read: boolean;
}

/* ─── Sample Data ─── */
const INIT_BOOKINGS: Booking[] = [
  { id: "BK001", stallNo: "A-12", location: "Main Block, Row A", size: "3x4m", startDate: "2025-03-01", endDate: "2025-03-31", days: 30, totalAmount: 450000, status: "confirmed", paymentMethod: "MTN Mobile Money", paymentId: "PAY001" },
  { id: "BK002", stallNo: "A-12", location: "Main Block, Row A", size: "3x4m", startDate: "2025-02-01", endDate: "2025-02-28", days: 28, totalAmount: 420000, status: "confirmed", paymentMethod: "MTN Mobile Money", paymentId: "PAY005" },
];
const INIT_PAYMENTS: VendorPayment[] = [
  { id: "PAY001", bookingId: "BK001", stallNo: "A-12", amount: 450000, date: "2025-03-01", method: "MTN Mobile Money", status: "paid", receiptNo: "RCT-2025-001" },
  { id: "PAY005", bookingId: "BK002", stallNo: "A-12", amount: 420000, date: "2025-02-01", method: "MTN Mobile Money", status: "paid", receiptNo: "RCT-2025-005" },
];
const AVAILABLE_STALLS = [
  { id: "S01", number: "A-01", location: "Main Block, Row A", size: "3x4m", dailyRate: 15000, section: "Block A" },
  { id: "S04", number: "B-15", location: "East Wing, Row B", size: "4x5m", dailyRate: 20000, section: "Block B" },
  { id: "S07", number: "D-01", location: "North Block, Row D", size: "6x8m", dailyRate: 35000, section: "Block D" },
  { id: "S08", number: "D-09", location: "North Block, Row D", size: "4x5m", dailyRate: 20000, section: "Block D" },
];
const INIT_DOCS: DocRecord[] = [
  { name: "Business License", number: "BL-2024-001", expiry: "2025-12-31", status: "valid" },
  { name: "Health Certificate", number: "HC-2024-089", expiry: "2025-06-15", status: "expiring" },
  { name: "Government ID", number: "CM90020001234A", expiry: "2030-01-01", status: "valid" },
];
const INIT_ANNOUNCEMENTS: AnnouncementItem[] = [
  { id: "ANN001", title: "Market Closure — Good Friday", content: "The market will be closed on 18th April 2025 in observance of Good Friday. All vendors are advised to plan accordingly. The market will resume normal operations on Saturday 19th April.", date: "2025-03-15", type: "closure", read: false },
  { id: "ANN002", title: "New Sanitation Rules Effective April 2025", content: "All vendors must maintain clean stalls at all times. Garbage must be disposed in the designated collection points. Failure to comply will attract a fine of UGX 10,000 per day.", date: "2025-03-10", type: "rule", read: false },
  { id: "ANN003", title: "Annual Market Day — April 30th 2025", content: "We are pleased to announce our Annual Market Day on April 30th. Special activities, entertainment, and discounts for customers. All vendors are encouraged to participate.", date: "2025-03-08", type: "event", read: true },
];

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

/* ─── Modal ─── */
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-card rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
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
const ConfirmDialog = ({ message, onConfirm, onCancel, confirmLabel = "Confirm", danger = false }:
  { message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; danger?: boolean }) => (
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

/* ─── Receipt Modal ─── */
const VendorReceiptModal = ({ payment, user, onClose }: { payment: VendorPayment; user: { name: string; id: string }; onClose: () => void }) => (
  <Modal title="Payment Receipt" onClose={onClose}>
    <div className="space-y-4">
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
          ["Receipt No.", payment.receiptNo],
          ["Payment ID", payment.id],
          ["Booking ID", payment.bookingId],
          ["Date", fmtDate(payment.date)],
          ["Vendor Name", user.name],
          ["Vendor ID", user.id],
          ["Stall Number", payment.stallNo],
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
        Thank you for your payment. Keep this receipt for your records.<br />
        Mbarara City Market Authority — © 2025
      </p>
    </div>
    <div className="flex gap-3 mt-4 pt-4 border-t">
      <button className="btn-outline flex-1" onClick={() => window.print()}>
        <Printer size={15} /> Print
      </button>
      <button className="btn-primary flex-1" onClick={onClose}>
        <CheckCircle size={15} /> Done
      </button>
    </div>
  </Modal>
);

/* ─── VENDOR OVERVIEW ─── */
const VendorOverview = ({
  user, bookings, payments, announcements, onTabChange
}: {
  user: { name: string; email: string; id: string };
  bookings: Booking[]; payments: VendorPayment[]; announcements: AnnouncementItem[];
  onTabChange: (t: string) => void;
}) => {
  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const unread = announcements.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">Welcome back,</p>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-white/80 text-sm mt-1">Nakato Fresh Produce · Stall A-12</p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
              <CheckCircle size={14} /> Account Active
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
              <MapPin size={14} /> Mbarara City Market
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Store, label: "My Stall", value: "A-12", sub: "Block A · 3x4m", color: "bg-primary" },
          { icon: CalendarDays, label: "Active Bookings", value: bookings.filter(b => b.status === "confirmed").length, sub: "Confirmed", color: "bg-info" },
          { icon: Receipt, label: "Total Paid", value: `UGX ${(totalPaid / 1000).toFixed(0)}K`, sub: "All time", color: "bg-success" },
          { icon: Bell, label: "Unread Notices", value: unread, sub: "Tap to view", color: "bg-warning" },
        ].map(s => (
          <div key={s.label} className="stat-card bg-card border flex items-start gap-3 cursor-pointer" onClick={() => s.label === "Unread Notices" ? onTabChange("announcements") : undefined}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <CalendarDays size={18} className="text-primary" /> My Recent Bookings
          </h3>
          <button onClick={() => onTabChange("booking")} className="text-xs text-primary hover:underline font-medium">Book New Stall →</button>
        </div>
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="flex items-start justify-between p-4 rounded-xl bg-secondary/50 gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-primary">{b.stallNo}</span>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-sm text-muted-foreground">{b.location}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(b.startDate)} — {fmtDate(b.endDate)} ({b.days} days)
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{b.paymentMethod}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-success">{fmtUGX(b.totalAmount)}</p>
                <span className={b.status === "confirmed" ? "badge-success" : b.status === "pending" ? "badge-warning" : "badge-danger"}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="text-center py-8">
              <Store size={32} className="text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
              <button onClick={() => onTabChange("booking")} className="btn-primary mt-3 text-xs py-1.5 px-4">Book a Stall</button>
            </div>
          )}
        </div>
      </div>

      {/* Announcements preview */}
      {announcements.filter(a => !a.read).length > 0 && (
        <div className="section-card border-l-4" style={{ borderLeftColor: "hsl(var(--warning))" }}>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Bell size={18} className="text-warning" /> Unread Announcements ({announcements.filter(a => !a.read).length})
          </h3>
          <div className="space-y-2">
            {announcements.filter(a => !a.read).slice(0, 2).map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-colors" onClick={() => onTabChange("announcements")}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.type === "closure" ? "bg-destructive" : a.type === "event" ? "bg-success" : "bg-warning"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(a.date)}</p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
          <button onClick={() => onTabChange("announcements")} className="btn-outline w-full mt-3 text-xs py-2">View All Announcements</button>
        </div>
      )}
    </div>
  );
};

/* ─── MY PROFILE ─── */
const MyProfile = ({ user, toast }: { user: { name: string; email: string; id: string }; toast: (m: string, t?: ToastItem["type"]) => void }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: "0771234567", email: user.email, businessName: "Nakato Fresh Produce", businessType: "Vegetables & Fruits" });
  const [saved, setSaved] = useState({ ...form });

  const save = () => {
    setSaved({ ...form });
    setEditing(false);
    toast("Profile updated successfully!", "success");
  };
  const cancel = () => {
    setForm({ ...saved });
    setEditing(false);
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="text-xl font-bold text-foreground">My Profile</h2>
          <p className="text-sm text-muted-foreground">View and update your account details</p>
        </div>
        {!editing ? (
          <button className="btn-outline" onClick={() => setEditing(true)}>
            <Edit size={15} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button className="btn-outline" onClick={cancel}>Cancel</button>
            <button className="btn-primary" onClick={save}>Save Changes</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="section-card flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center font-bold text-3xl text-primary">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground">Market Vendor</p>
            <span className="badge-success mt-1 inline-block">Active</span>
          </div>
          <div className="w-full pt-3 border-t border-border space-y-2 text-sm text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor ID</span>
              <span className="font-mono font-bold text-primary">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stall</span>
              <span className="font-bold">A-12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span>Jan 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business</span>
              <span className="font-semibold text-right max-w-[55%]">{saved.businessName}</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="section-card lg:col-span-2">
          <h3 className="font-bold text-foreground mb-4">Account Information</h3>
          {editing && (
            <div className="mb-4 p-3 rounded-lg bg-info/10 border border-info/30 text-info text-xs font-medium flex items-center gap-2">
              <Edit size={13} /> Editing mode — make your changes and click "Save Changes"
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name</label>
              <input className="form-input bg-muted/50" value={user.name} disabled />
              <p className="text-xs text-muted-foreground mt-1">Name cannot be changed</p>
            </div>
            <div>
              <label className="form-label">National ID</label>
              <input className="form-input bg-muted/50" value="CM90020001234A" disabled />
              <p className="text-xs text-muted-foreground mt-1">ID cannot be changed</p>
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} disabled={!editing} />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} disabled={!editing} />
            </div>
            <div>
              <label className="form-label">Business Name</label>
              <input className="form-input" value={form.businessName} onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))} disabled={!editing} />
            </div>
            <div>
              <label className="form-label">Business Type</label>
              <select className="form-input" value={form.businessType} onChange={e => setForm(p => ({ ...p, businessType: e.target.value }))} disabled={!editing}>
                {["Vegetables & Fruits", "Electronics", "Clothing & Textiles", "Food & Beverages", "Hardware & Tools", "Crafts & Artwork"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          {editing && (
            <div className="flex gap-3 mt-5 pt-4 border-t border-border">
              <button className="btn-outline flex-1" onClick={cancel}>Discard Changes</button>
              <button className="btn-primary flex-1" onClick={save}>Save Changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── STALL BOOKING ─── */
const StallBooking = ({ bookings, setBookings, payments, setPayments, toast }: {
  bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  payments: VendorPayment[]; setPayments: React.Dispatch<React.SetStateAction<VendorPayment[]>>;
  toast: (m: string, t?: ToastItem["type"]) => void;
}) => {
  const [selectedStall, setSelectedStall] = useState<typeof AVAILABLE_STALLS[0] | null>(null);
  const [booking, setBooking] = useState({ startDate: "", endDate: "", method: "MTN Mobile Money" });
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);

  const days = booking.startDate && booking.endDate
    ? Math.max(1, Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86400000))
    : 0;
  const total = selectedStall ? days * selectedStall.dailyRate : 0;

  const sections = ["All", ...Array.from(new Set(AVAILABLE_STALLS.map(s => s.section)))];
  const filtered = AVAILABLE_STALLS.filter(s => {
    const matchSearch = s.number.toLowerCase().includes(search.toLowerCase()) || s.section.toLowerCase().includes(search.toLowerCase());
    const matchSection = sectionFilter === "All" || s.section === sectionFilter;
    return matchSearch && matchSection;
  });

  const confirm = () => {
    if (!selectedStall || !booking.startDate || !booking.endDate) return;
    const id = `BK${Date.now().toString().slice(-4)}`;
    const payId = `PAY${Date.now().toString().slice(-4)}`;
    const receiptNo = `RCT-2025-${payId}`;
    const newBooking: Booking = {
      id, stallNo: selectedStall.number, location: selectedStall.location, size: selectedStall.size,
      startDate: booking.startDate, endDate: booking.endDate, days,
      totalAmount: total, status: "confirmed", paymentMethod: booking.method, paymentId: payId
    };
    const newPayment: VendorPayment = {
      id: payId, bookingId: id, stallNo: selectedStall.number, amount: total,
      date: new Date().toISOString().split("T")[0], method: booking.method,
      status: "paid", receiptNo
    };
    setBookings(bs => [newBooking, ...bs]);
    setPayments(ps => [newPayment, ...ps]);
    setSuccessBooking(newBooking);
    setSelectedStall(null);
    setBooking({ startDate: "", endDate: "", method: "MTN Mobile Money" });
    toast(`Stall ${selectedStall.number} booked for ${days} days! Total: ${fmtUGX(total)}`, "success");
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="text-xl font-bold text-foreground">Book a Stall</h2>
          <p className="text-sm text-muted-foreground">Browse and book available market stalls</p>
        </div>
      </div>

      {successBooking && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30 text-success animate-fade-in">
          <CheckCircle size={20} className="flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Booking Confirmed! ID: {successBooking.id}</p>
            <p className="text-sm opacity-80">Stall {successBooking.stallNo} booked — {successBooking.days} days — {fmtUGX(successBooking.totalAmount)}</p>
          </div>
          <button onClick={() => setSuccessBooking(null)}><X size={16} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="form-input pl-9" placeholder="Search by stall number or block…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {sections.map(s => (
            <button key={s} onClick={() => setSectionFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${sectionFilter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="section-card hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => setSelectedStall(s)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-xl text-foreground">{s.number}</p>
                <p className="text-xs text-muted-foreground">{s.section}</p>
              </div>
              <span className="badge-success">Available</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><MapPin size={12} /> Location</span>
                <span className="font-medium text-foreground text-right max-w-[55%]">{s.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size</span>
                <span className="font-medium">{s.size}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Daily Rate</span>
                <span className="font-bold text-primary">{fmtUGX(s.dailyRate)}</span>
              </div>
            </div>
            <button
              className="btn-primary w-full justify-center mt-4 py-2"
              onClick={e => { e.stopPropagation(); setSelectedStall(s); }}
            >
              Book This Stall
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 section-card">
            <Store size={32} className="text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-muted-foreground text-sm">No stalls found matching your search.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedStall && (
        <Modal title={`Book Stall ${selectedStall.number}`} onClose={() => setSelectedStall(null)}>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Stall</span>
                <span className="font-bold text-primary">{selectedStall.number}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{selectedStall.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Size · Daily Rate</span>
                <span className="font-medium">{selectedStall.size} · {fmtUGX(selectedStall.dailyRate)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Start Date *</label>
                <input type="date" className="form-input" value={booking.startDate} onChange={e => setBooking(p => ({ ...p, startDate: e.target.value }))} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <label className="form-label">End Date *</label>
                <input type="date" className="form-input" value={booking.endDate} onChange={e => setBooking(p => ({ ...p, endDate: e.target.value }))} min={booking.startDate || new Date().toISOString().split("T")[0]} />
              </div>
            </div>
            {days > 0 && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{days} days</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span className="font-medium">{fmtUGX(selectedStall.dailyRate)}/day</span></div>
                <div className="flex justify-between border-t border-primary/20 pt-1 font-bold text-primary text-base">
                  <span>Total Fee</span><span>{fmtUGX(total)}</span>
                </div>
              </div>
            )}
            <div>
              <label className="form-label">Payment Method</label>
              <select className="form-input" value={booking.method} onChange={e => setBooking(p => ({ ...p, method: e.target.value }))}>
                {["MTN Mobile Money", "Airtel Money", "Bank Transfer", "Credit/Debit Card"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            {days > 0 && (
              <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground flex items-start gap-2">
                <Clock size={13} className="flex-shrink-0 mt-0.5" />
                <span>A 10-minute hold will be placed on this stall while you confirm payment.</span>
              </div>
            )}
            <div className="flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setSelectedStall(null)}>Cancel</button>
              <button
                className="btn-primary flex-1"
                onClick={confirm}
                disabled={!booking.startDate || !booking.endDate || days < 1}
              >
                Confirm &amp; Pay {days > 0 ? fmtUGX(total) : ""}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ─── PAYMENT HISTORY ─── */
const PaymentHistory = ({ payments, user }: { payments: VendorPayment[]; user: { name: string; id: string } }) => {
  const [receiptView, setReceiptView] = useState<VendorPayment | null>(null);

  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="text-xl font-bold text-foreground">Payment History</h2>
          <p className="text-sm text-muted-foreground">All your payment records and receipts</p>
        </div>
        <button className="btn-outline" onClick={() => window.print()}>
          <Printer size={15} /> Print History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Paid", value: fmtUGX(totalPaid), color: "bg-success", icon: Receipt },
          { label: "Payments Made", value: payments.filter(p => p.status === "paid").length, color: "bg-primary", icon: CheckCircle },
          { label: "Pending", value: payments.filter(p => p.status === "pending").length, color: "bg-warning", icon: Clock },
        ].map(s => (
          <div key={s.label} className="stat-card bg-card border flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">{s.label}</p>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="section-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Receipt No.</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Stall</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Amount</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase hidden sm:table-cell">Method</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase hidden md:table-cell">Date</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Status</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="table-row-hover border-b border-border/50">
                <td className="py-3 px-4 font-mono text-xs font-bold text-primary">{p.receiptNo}</td>
                <td className="py-3 px-4 font-bold">{p.stallNo}</td>
                <td className="py-3 px-4 font-bold text-success">{fmtUGX(p.amount)}</td>
                <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell text-xs">{p.method}</td>
                <td className="py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">{fmtDate(p.date)}</td>
                <td className="py-3 px-4">
                  <span className={p.status === "paid" ? "badge-success" : p.status === "pending" ? "badge-warning" : "badge-danger"}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setReceiptView(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-info hover:bg-info/10 transition-colors" title="View Receipt">
                      <FileText size={15} />
                    </button>
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
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">No payment records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {receiptView && <VendorReceiptModal payment={receiptView} user={user} onClose={() => setReceiptView(null)} />}
    </div>
  );
};

/* ─── COMPLIANCE STATUS ─── */
const VendorCompliance = ({ toast }: { toast: (m: string, t?: ToastItem["type"]) => void }) => {
  const [docs, setDocs] = useState<DocRecord[]>(INIT_DOCS);
  const [uploading, setUploading] = useState<string | null>(null);

  const simulateUpload = (docName: string) => {
    setUploading(docName);
    toast(`Uploading ${docName}…`, "info");
    setTimeout(() => {
      setDocs(ds => ds.map(d => d.name === docName ? { ...d, status: "valid" as const, expiry: "2026-12-31" } : d));
      setUploading(null);
      toast(`${docName} uploaded and submitted for review.`, "success");
    }, 1800);
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="text-xl font-bold text-foreground">My Compliance Status</h2>
          <p className="text-sm text-muted-foreground">Track and renew your compliance documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {docs.map(doc => (
          <div key={doc.name} className="section-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-foreground text-sm">{doc.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{doc.number}</p>
              </div>
              <span className={doc.status === "valid" ? "badge-success" : doc.status === "expiring" ? "badge-warning" : "badge-danger"}>
                {doc.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <CalendarDays size={12} />
              <span>Expires: <span className="font-semibold text-foreground">{fmtDate(doc.expiry)}</span></span>
            </div>
            {doc.status === "expiring" && (
              <div className="p-2 rounded-lg bg-warning/10 border border-warning/30 text-xs text-warning font-medium flex items-center gap-1.5 mb-3">
                <AlertTriangle size={12} />
                Renew within 7 days to avoid suspension
              </div>
            )}
            {doc.status === "expired" && (
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive font-medium flex items-center gap-1.5 mb-3">
                <XCircle size={12} />
                Document expired — booking restricted
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="section-card">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Upload size={18} className="text-primary" /> Upload / Renew Documents
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {docs.map(doc => (
            <div key={doc.name} className={`p-4 border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer
              ${doc.status === "valid" ? "border-success/40 hover:border-success" : "border-warning/60 hover:border-warning"}`}
              onClick={() => !uploading && simulateUpload(doc.name)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2
                ${doc.status === "valid" ? "bg-success/10" : "bg-warning/10"}`}>
                {uploading === doc.name
                  ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  : <Upload size={18} className={doc.status === "valid" ? "text-success" : "text-warning"} />
                }
              </div>
              <p className="font-semibold text-sm text-foreground">{doc.name}</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — Max 5MB</p>
              <button
                className={`mt-3 py-1.5 px-3 text-xs rounded-lg font-medium border transition-all ${
                  uploading === doc.name ? "opacity-50 cursor-not-allowed border-border" : "btn-outline"}`}
                disabled={!!uploading}
                onClick={e => { e.stopPropagation(); simulateUpload(doc.name); }}
              >
                {uploading === doc.name ? "Uploading…" : "Upload New"}
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
          <AlertTriangle size={12} />
          Uploaded documents will be reviewed by the Market Administrator within 1-2 business days.
        </p>
      </div>
    </div>
  );
};

/* ─── VENDOR ANNOUNCEMENTS ─── */
const VendorAnnouncements = ({ announcements, setAnnouncements }: {
  announcements: AnnouncementItem[];
  setAnnouncements: React.Dispatch<React.SetStateAction<AnnouncementItem[]>>;
}) => {
  const [selected, setSelected] = useState<AnnouncementItem | null>(null);

  const typeColors = { notice: "badge-info", closure: "badge-danger", event: "badge-success", rule: "badge-warning" } as const;
  const typeIcons = {
    closure: "🔴", event: "🎉", rule: "📋", notice: "📢"
  };

  const openAnnouncement = (a: AnnouncementItem) => {
    setSelected(a);
    if (!a.read) {
      setAnnouncements(as => as.map(x => x.id === a.id ? { ...x, read: true } : x));
    }
  };

  const markAllRead = () => {
    setAnnouncements(as => as.map(a => ({ ...a, read: true })));
  };

  const unread = announcements.filter(a => !a.read).length;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="text-xl font-bold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground">{unread > 0 ? `${unread} unread` : "All read"} · From Market Administrator</p>
        </div>
        {unread > 0 && (
          <button className="btn-outline text-xs py-2 px-3" onClick={markAllRead}>
            <CheckCircle size={13} /> Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {announcements.map(a => (
          <div
            key={a.id}
            className={`section-card cursor-pointer hover:shadow-md transition-all duration-200 ${!a.read ? "border-l-4" : ""}`}
            style={!a.read ? { borderLeftColor: "hsl(var(--warning))" } : {}}
            onClick={() => openAnnouncement(a)}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{typeIcons[a.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className={`font-bold text-foreground ${!a.read ? "text-foreground" : "text-muted-foreground"}`}>{a.title}</h4>
                  <span className={typeColors[a.type]}>{a.type}</span>
                  {!a.read && <span className="badge-warning">New</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{fmtDate(a.date)} · Market Administrator</p>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{a.content}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Announcement Detail Modal */}
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={typeColors[selected.type]}>{selected.type}</span>
              <span className="text-xs text-muted-foreground">{fmtDate(selected.date)}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{selected.content}</p>
            <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground flex items-center gap-2">
              <User size={12} />
              <span>Posted by: Market Administrator · Mbarara City Market</span>
            </div>
            <button className="btn-primary w-full justify-center" onClick={() => setSelected(null)}>
              <CheckCircle size={15} /> Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ─── MAIN VENDOR DASHBOARD ─── */
const VendorDashboard = ({
  user, onLogout
}: { user: { name: string; email: string; id: string }; onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState<Booking[]>(INIT_BOOKINGS);
  const [payments, setPayments] = useState<VendorPayment[]>(INIT_PAYMENTS);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INIT_ANNOUNCEMENTS);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { toasts, toast, dismiss } = useToast();

  const unread = announcements.filter(a => !a.read).length;

  const navItems = [
    { id: "overview", label: "My Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: User },
    { id: "booking", label: "Book a Stall", icon: Store },
    { id: "payments", label: "Payment History", icon: CreditCard },
    { id: "compliance", label: "My Compliance", icon: ShieldAlert },
    { id: "announcements", label: "Announcements", icon: Bell, badge: unread },
  ];

  const DashboardLayout = React.lazy(() => import("./DashboardLayout"));

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading…</div>}>
        <DashboardLayout user={user} role="vendor" activeTab={activeTab} onTabChange={setActiveTab}
          onLogout={() => setShowLogoutConfirm(true)} navItems={navItems}>
          {activeTab === "overview" && <VendorOverview user={user} bookings={bookings} payments={payments} announcements={announcements} onTabChange={setActiveTab} />}
          {activeTab === "profile" && <MyProfile user={user} toast={toast} />}
          {activeTab === "booking" && <StallBooking bookings={bookings} setBookings={setBookings} payments={payments} setPayments={setPayments} toast={toast} />}
          {activeTab === "payments" && <PaymentHistory payments={payments} user={user} />}
          {activeTab === "compliance" && <VendorCompliance toast={toast} />}
          {activeTab === "announcements" && <VendorAnnouncements announcements={announcements} setAnnouncements={setAnnouncements} />}
        </DashboardLayout>
      </React.Suspense>

      {showLogoutConfirm && (
        <ConfirmDialog
          message="Are you sure you want to log out of MVMS?"
          confirmLabel="Yes, Logout" danger
          onConfirm={onLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
};

export default VendorDashboard;
