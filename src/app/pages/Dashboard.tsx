import { useRental, Unit } from "../context/RentalContext";
import { useAuth } from "../context/AuthContext";
import { Monitor, CircleDot, Clock, ShieldCheck, AlertCircle, CheckCircle2, Crown, Star, Gamepad2 } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const { units } = useRental();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const getMembershipGradient = (tier?: string) => {
    switch (tier) {
      case "vip":
        return "from-purple-600 via-pink-500 to-orange-500";
      case "premium":
        return "from-blue-600 via-indigo-500 to-cyan-400";
      default:
        return "from-slate-500 to-slate-400";
    }
  };

  const getMembershipBenefits = (tier?: string) => {
    switch (tier) {
      case "vip":
        return ["Unlimited Reservations", "20% Discount", "VIP Support"];
      case "premium":
        return ["5 Reservations/Day", "10% Discount", "Priority Booking"];
      default:
        return ["2 Reservations/Day", "Standard Rates"];
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Membership Status Banner - Added Glass Effect & Softer Shadow */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden bg-gradient-to-r ${getMembershipGradient(profile.membershipTier)} rounded-3xl p-5 text-white shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-white/20`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner border border-white/30">
                <Crown size={28} className="text-yellow-300 drop-shadow-md" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Welcome back, {profile.name}!</p>
                <p className="font-black text-2xl tracking-wide drop-shadow-sm">{profile.membershipTier?.toUpperCase() || "FREE"} MEMBER</p>
              </div>
            </div>
            {profile.membershipTier === "free" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/settings")}
                className="gap-1.5 text-xs font-bold rounded-full px-4 hover:scale-105 transition-transform"
              >
                <Star size={14} className="text-yellow-500" />
                Upgrade
              </Button>
            )}
          </div>
          <div className="mt-4 flex gap-2 flex-wrap relative z-10">
            {getMembershipBenefits(profile.membershipTier).map((benefit, i) => (
              <Badge key={i} variant="secondary" className="bg-black/20 text-white border-white/10 text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
                {benefit}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Header Section - Modern Typography */}
      <div className="flex justify-between items-end" aria-live="polite">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
            Console Status
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Live availability of our gaming units</p>
        </div>
        <div className="flex gap-2 text-xs font-bold" aria-label="Current unit availability counts">
          <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/15 px-3 py-1.5 rounded-full border border-emerald-500/20 backdrop-blur-sm">
            <CircleDot size={12} className="animate-pulse" aria-hidden="true" /> 
            {units.filter(u => u.status === 'available').length} Ready
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 bg-rose-500/15 px-3 py-1.5 rounded-full border border-rose-500/20 backdrop-blur-sm">
            <Clock size={12} aria-hidden="true" /> 
            {units.filter(u => u.status === 'rented').length} In Use
          </span>
        </div>
      </div>

      {/* Hero Banner - Softer rounding and deeper shadow */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-56 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 group"
      >
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1644571580854-114d7d8fa383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGNvbnNvbGUlMjBkdWFsc2Vuc2UlMjBjb250cm9sbGVyfGVufDF8fHx8MTc3MTQxOTkzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="PlayStation 5 console with DualSense controller"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
          <p className="text-white font-black text-3xl leading-tight drop-shadow-lg">Next-Gen Gaming Experience</p>
          <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mt-1">Premium PS5 & PS4 Pro Units</p>
        </div>
      </motion.div>

      {/* Features Section - Glassmorphism Card */}
      <section className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/50 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-5">
          <ShieldCheck size={20} className="text-blue-500" /> Why Reserve Ahead?
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Guaranteed Spot", desc: "No more waiting in line for your favorite console.", icon: CheckCircle2 },
            { title: "Real-time Tracking", desc: "See exactly when units become available.", icon: Monitor },
            { title: "Smart Alerts", desc: "Get notified 10 mins before session ends.", icon: Clock }
          ].map((benefit, i) => (
            <li key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="p-2 w-max bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                <benefit.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{benefit.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{benefit.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Unit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" role="list">
        {units.map((unit, index) => (
          <UnitCard key={unit.id} unit={unit} index={index} />
        ))}
      </div>
    </div>
  );
}

function UnitCard({ unit, index }: { unit: Unit; index: number }) {
  // Menggunakan warna transparan (neon/glass) bukan solid color
  const statusStyles = {
    available: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    rented: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    maintenance: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  };

  const statusLabel = {
    available: "Ready to Play",
    rented: "Occupied",
    maintenance: "Under Repair",
  };

  const Icon = {
    available: ShieldCheck,
    rented: Clock,
    maintenance: AlertCircle,
  }[unit.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-100 dark:border-slate-700 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300`}
      role="listitem"
      aria-labelledby={`unit-title-${unit.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div 
            className={`p-3.5 rounded-2xl ${unit.status === 'available' ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500'}`}
            aria-hidden="true"
          >
            <Gamepad2 size={26} strokeWidth={1.5} />
          </div>
          <div>
            <h3 id={`unit-title-${unit.id}`} className="font-black text-lg dark:text-slate-100">{unit.name}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5" aria-label={`Console type ${unit.type} at ${unit.pricePerHour} dollars per hour`}>
              <span className="text-blue-600 dark:text-blue-400">{unit.type}</span> <span className="mx-1">•</span> ${unit.pricePerHour}/hr
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusStyles[unit.status]}`}
            role="status"
          >
            <Icon size={12} aria-hidden="true" />
            {statusLabel[unit.status]}
          </span>
        </div>
      </div>

      {unit.status === 'rented' && (
        <div className="mt-5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 italic">
            <Clock size={14} className="text-rose-500" aria-hidden="true" />
            Session ending soon...
          </div>
          {/* Opsi tambahan untuk mempercantik UI */}
          <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 w-3/4 animate-pulse"></div>
          </div>
        </div>
      )}
    </motion.div>
  );
}