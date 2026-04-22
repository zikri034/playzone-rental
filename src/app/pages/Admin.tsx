import { useRental } from "../context/RentalContext";
import { 
  Settings, 
  Plus, 
  LayoutDashboard, 
  Database, 
  Info, 
  RefreshCw,
  User,
  Shield,
  Moon,
  Bell,
  ChevronRight,
  LogOut,
  TerminalSquare
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { units, bookings } = useRental();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((acc, curr) => acc + curr.totalCost, 0);

  const stats = [
    { label: "Total Units", value: units.length, icon: LayoutDashboard, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Active Rentals", value: units.filter(u => u.status === 'rented').length, icon: Database, color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: Plus, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  const settingsOptions = [
    { 
      id: 'profile',
      label: "Profile", 
      icon: User, 
      description: "Manage your personal info",
      color: "text-indigo-600",
      bg: "bg-indigo-500/10",
      action: () => toast.info("Profile settings opened")
    },
    { 
      id: 'account',
      label: "Account", 
      icon: Shield, 
      description: "Security and password",
      color: "text-teal-600",
      bg: "bg-teal-500/10",
      action: () => toast.info("Account security settings opened")
    },
  ];

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
              <Settings size={28} />
            </div>
            Command Center
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Manage your PlayStation rental operations.</p>
        </div>
        <div className="text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm shadow-sm">
          <RefreshCw size={14} className="animate-spin" /> Live Sync
        </div>
      </div>

      {/* Stats Section - Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-4"
          >
            <div className={`p-4 rounded-2xl border ${stat.bg} ${stat.color} ${stat.border}`}>
              <stat.icon size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <User size={18} className="text-blue-500" /> Admin Settings
          </h3>
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-slate-700 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
            {settingsOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={opt.action}
                className="w-full flex items-center justify-between p-5 hover:bg-white/80 dark:hover:bg-slate-700/50 transition-colors focus-visible:bg-slate-50 outline-none group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl border transition-transform group-hover:scale-105 ${opt.bg} ${opt.color} border-${opt.color.split('-')[1]}-500/20`}>
                    <opt.icon size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{opt.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{opt.description}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Settings size={18} className="text-blue-500" /> App Preferences
          </h3>
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-slate-700 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
            
            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Notifications</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Rental alerts & status</p>
                </div>
              </div>
              <button 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded-xl">
                  <Moon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Dark Mode</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Reduce eye strain</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  toast.success(`Theme changed to ${!isDarkMode ? 'Dark' : 'Light'}`);
                }}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-4 focus:ring-purple-500/30 ${isDarkMode ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${isDarkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone & System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="md:col-span-1">
          <button 
            onClick={() => toast.error("Logout feature currently restricted")}
            className="w-full h-full min-h-[100px] flex flex-col items-center justify-center gap-3 p-5 text-rose-600 font-bold bg-rose-500/5 hover:bg-rose-500/10 rounded-[2rem] border border-rose-500/20 transition-all hover:border-rose-500/40 focus:ring-4 focus:ring-rose-500/20 outline-none group"
          >
            <LogOut size={28} className="group-hover:scale-110 transition-transform" /> 
            <span>Logout Session</span>
          </button>
        </div>

        <div className="md:col-span-2 bg-slate-900 dark:bg-black rounded-[2rem] p-7 text-white overflow-hidden relative shadow-[0_10px_40px_rgb(0,0,0,0.2)] border border-slate-700/50">
          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest">
              <TerminalSquare size={16} /> System Information
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Dashboard operates in real-time. Secure backend integration is active.
            </p>
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-xs space-y-3 font-mono">
              <p className="flex justify-between items-center">
                <span className="text-slate-400">Database Driver</span>
                <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Supabase (PostgreSQL)</span>
              </p>
              <p className="flex justify-between items-center">
                <span className="text-slate-400">Connection Status</span>
                <span className="text-blue-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> ONLINE</span>
              </p>
            </div>
          </div>
          
          <div className="absolute -bottom-16 -right-16 opacity-5 text-cyan-500">
            <Database size={250} />
          </div>
        </div>
      </div>
    </div>
  );
}