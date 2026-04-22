import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom"; // Tambahkan useNavigate
import { 
  LayoutDashboard, 
  Gamepad2, 
  Clock, 
  Shield, 
  Settings, 
  Menu, 
  X,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../utils/supabase/client"; // 🔥 Import supabase untuk logout
import { toast } from "sonner";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ambil 'user' (data login utama) dari useAuth
  const { user, signOut } = useAuth();

  // Gunakan email yang kamu daftarkan tadi
  const isAdmin = user?.email === "zikrirausyan@gmail.com"; 

  // ... sisa kode useEffect dan handleSignOut tetap sama ...

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // 🔥 Fungsi Logout yang ampuh
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      if (typeof signOut === 'function') await signOut();
      
      localStorage.clear();
      sessionStorage.clear();
      
      toast.success("Berhasil keluar!");
      
      // Paksa pindah halaman dan refresh total
      window.location.href = "/auth"; 
    } catch (error) {
      toast.error("Gagal keluar");
    }
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/reserve", label: "Reserve PS", icon: Gamepad2 },
    { path: "/my-rentals", label: "My Rentals", icon: Clock },
    ...(isAdmin ? [{ path: "/admin", label: "Admin Center", icon: Shield }] : []),
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
          <Gamepad2 size={24} />
        </div>
        <div>
          <h1 className="font-black text-xl tracking-tight text-slate-800 dark:text-white leading-none">
            Play<span className="text-blue-600 dark:text-blue-400">Zone</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Rental System
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${
                isActive
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-inner border border-blue-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent"
              }`
            }
          >
            <item.icon size={20} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        {/* 🔥 Tambahkan handleSignOut di sini */}
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-slate-950 flex font-sans selection:bg-blue-500/30">
      
      <aside className="hidden lg:block w-72 fixed inset-y-0 left-0 z-50">
        <div className="h-full m-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <SidebarContent />
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 inset-x-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg text-white">
            <Gamepad2 size={20} />
          </div>
          <h1 className="font-black text-lg text-slate-800 dark:text-white">PlayZone</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
        >
          <Menu size={24} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white dark:bg-slate-900 z-50 shadow-2xl lg:hidden"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full lg:pl-80 pt-24 lg:pt-8 pr-0 lg:pr-8 pb-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}