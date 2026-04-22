import { useRental } from "../context/RentalContext";
import { 
  Settings, 
  Plus, 
  LayoutDashboard, 
  Database, 
  RefreshCw,
  User,
  Shield,
  Moon,
  Bell,
  ChevronRight,
  LogOut,
  TerminalSquare,
  PlayCircle,
  Timer,
  XCircle
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { units, bookings, endBooking, loading } = useRental();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Filter hanya booking yang statusnya masih 'active'
  const activeSessions = bookings.filter(b => b.status === 'active');

  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((acc, curr) => acc + curr.totalCost, 0);

  const stats = [
    { label: "Total Units", value: units.length, icon: LayoutDashboard, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Active Rentals", value: activeSessions.length, icon: PlayCircle, color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: Plus, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  const handleEndSession = async (id: string, name: string) => {
    if (window.confirm(`Selesaikan sesi untuk ${name}?`)) {
      await endBooking(id);
      toast.success(`Sesi ${name} berhasil diselesaikan`);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
              <Settings size={28} />
            </div>
            Command Center
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Monitoring and manage your PlayStation units.</p>
        </div>
        <div className="text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Live Sync
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 rounded-2xl border ${stat.bg} ${stat.color} ${stat.border}`}>
              <stat.icon size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- LIVE SESSION MONITOR (FITUR BARU) --- */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Timer size={18} className="text-rose-500" /> Live Session Monitor
        </h3>
        
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Total Cost</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSessions.length > 0 ? (
                  activeSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{session.customerName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono text-xs">
                          Unit {session.unitId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {session.durationHours} Hours
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        ${session.totalCost}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleEndSession(session.id, session.customerName)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors group"
                          title="End Session"
                        >
                          <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                      No active rentals at the moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Settings & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="bg-slate-900 rounded-[2rem] p-7 text-white relative overflow-hidden shadow-xl border border-slate-700/50 lg:col-span-2">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest">
              <TerminalSquare size={16} /> Admin Intelligence
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Semua data di atas ditarik langsung dari Supabase. Klik tombol <XCircle size={14} className="inline mb-1" /> untuk mengosongkan unit PS dan menyelesaikan transaksi.
            </p>
          </div>
          <div className="absolute -bottom-16 -right-16 opacity-10 text-cyan-500 rotate-12">
            <Database size={200} />
          </div>
        </div>
      </div>
    </div>
  );
}