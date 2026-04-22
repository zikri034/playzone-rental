import { useState, useMemo } from "react";
import { useRental } from "../context/RentalContext";
import { CreditCard, Gamepad2, User, Clock, QrCode, Banknote, Wallet, Sparkles, CalendarClock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase/client";

export default function Reserve() {
  const { units, addBooking } = useRental();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    unitId: "",
    customerName: "",
    startTime: "", 
    durationHours: 1,
    paymentMethod: "" as
      | "credit-card"
      | "debit-card"
      | "qr-payment"
      | "cash"
      | "e-wallet"
      | "",
  });

  const availableUnits = useMemo(
    () => units.filter((u) => u.status === "available"),
    [units]
  );

  const selectedUnit = useMemo(
    () => units.find((u) => u.id === formData.unitId),
    [units, formData.unitId]
  );

  const totalPrice = useMemo(() => {
    if (!selectedUnit) return 0;
    return selectedUnit.pricePerHour * formData.durationHours;
  }, [selectedUnit, formData.durationHours]);

  // Memblokir pemilihan waktu di masa lalu
  const minDateTime = new Date().toISOString().slice(0, 16);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.unitId || !formData.customerName || !formData.startTime || !formData.paymentMethod) {
      setErrorMsg("Please complete all fields to continue.");
      return;
    }

    try {
      setLoading(true);

      const start = new Date(formData.startTime);
      const end = new Date(
        start.getTime() + formData.durationHours * 60 * 60 * 1000
      );

      // 🔥 1. CEK JADWAL BENTROK KE SUPABASE (DOUBLE-BOOKING CHECK)
      const { data: conflictingBookings, error: checkError } = await supabase
        .from("bookings")
        .select("id")
        .eq("playstation", selectedUnit?.name)
        .lt("start_time", end.toISOString()) 
        .gt("end_time", start.toISOString()); 

      if (checkError) {
        console.log("Check error:", checkError);
        setErrorMsg("Failed to check schedule availability.");
        setLoading(false);
        return;
      }

      // 🔥 2. JIKA ADA BENTROK, HENTIKAN PROSES!
      if (conflictingBookings && conflictingBookings.length > 0) {
        setErrorMsg(`Oops! ${selectedUnit?.name} sudah dibooking pada rentang jam tersebut. Silakan pilih jam atau console lain.`);
        setLoading(false);
        return;
      }

      // 🔥 3. JIKA JADWAL AMAN, BARU SIMPAN KE DATABASE
      const { error: insertError } = await supabase.from("bookings").insert([
        {
          name: formData.customerName,
          playstation: selectedUnit?.name,
          start_time: start,
          end_time: end,
          payment_method: formData.paymentMethod,
          total_price: totalPrice,
        },
      ]);

      if (insertError) {
        console.log("Insert error:", insertError);
        setErrorMsg("Failed to save booking. Please try again.");
        return;
      }

      // Update context lokal agar UI langsung update
      addBooking({
        unitId: formData.unitId,
        customerName: formData.customerName,
        durationHours: formData.durationHours,
        totalCost: totalPrice,
        startTime: start,
        paymentMethod: formData.paymentMethod,
      });

      navigate("/my-rentals");
    } catch (err) {
      console.log(err);
      setErrorMsg("Something went wrong with the connection.");
    } finally {
      setLoading(false); 
    }
  };

  const isDisabled =
    !formData.unitId ||
    !formData.customerName ||
    !formData.startTime || 
    !formData.paymentMethod ||
    loading;

  const paymentOptions = [
    { key: "credit-card", icon: CreditCard, label: "Credit Card" },
    { key: "debit-card", icon: CreditCard, label: "Debit Card" },
    { key: "qr-payment", icon: QrCode, label: "QRIS / QR" },
    { key: "e-wallet", icon: Wallet, label: "E-Wallet" },
    { key: "cash", icon: Banknote, label: "Cash" },
  ];

  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
          New Reservation
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Book your console and secure your playtime.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Main Form Container - Glassmorphism */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
          
          {/* SELECT CONSOLE */}
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg"><Gamepad2 size={18} /></div> 
              Select Console
            </label>

            <div className="grid grid-cols-2 gap-4 mt-2">
              {availableUnits.map((unit) => {
                const isSelected = formData.unitId === unit.id;
                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, unitId: unit.id }))}
                    className={`relative text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isSelected
                        ? "border-blue-500 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 ring-2 ring-blue-500/20 shadow-inner"
                        : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 p-2 text-blue-500">
                        <Sparkles size={16} className="animate-pulse" />
                      </div>
                    )}
                    <p className={`font-black text-lg ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}>
                      {unit.name}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{unit.type}</p>
                    <div className="mt-3 inline-block px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        ${unit.pricePerHour}<span className="text-slate-400 font-normal text-xs">/hr</span>
                      </p>
                    </div>
                  </button>
                );
              })}
              {availableUnits.length === 0 && (
                <div className="col-span-2 p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  No consoles currently available.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NAME */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-purple-500/10 text-purple-600 rounded-lg"><User size={18} /></div>
                Customer Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, customerName: e.target.value }))
                }
                className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-white placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* SCHEDULE TIME */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-pink-500/10 text-pink-600 rounded-lg"><CalendarClock size={18} /></div>
                Schedule Playtime
              </label>
              <input
                type="datetime-local"
                min={minDateTime} 
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, startTime: e.target.value }))
                }
                className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-white placeholder:text-slate-400 shadow-sm"
              />
            </div>
          </div>

          {/* DURATION */}
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg"><Clock size={18} /></div>
              Duration <span className="text-blue-600 dark:text-blue-400 ml-1">({formData.durationHours} Hours)</span>
            </label>
            <div className="bg-white/80 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <input
                type="range"
                min="1"
                max="12"
                value={formData.durationHours}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    durationHours: Number(e.target.value),
                  }))
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 font-medium mt-2">
                <span>1h</span>
                <span>6h</span>
                <span>12h</span>
              </div>
            </div>
          </div>

          {/* PAYMENT */}
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-orange-500/10 text-orange-600 rounded-lg"><CreditCard size={18} /></div>
              Payment Method
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {paymentOptions.map((p) => {
                const isSelected = formData.paymentMethod === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: p.key as any,
                      }))
                    }
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-inner ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-blue-300 text-slate-600 dark:text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    <p.icon size={24} strokeWidth={1.5} />
                    <span className="text-[11px] font-bold tracking-wide uppercase">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl text-sm font-bold text-center flex justify-center items-center gap-2">
              <Sparkles size={16} /> {errorMsg}
            </div>
          )}
        </div>

        {/* GLOWING SUMMARY */}
        <AnimatePresence>
          {formData.unitId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 rounded-[2rem] text-white shadow-[0_10px_40px_rgb(59,130,246,0.3)] relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Reservation Summary</p>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="font-black text-2xl">{selectedUnit?.name}</p>
                    <p className="text-blue-200 text-sm">
                      {formData.startTime ? new Date(formData.startTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Schedule not set"} 
                      <br/>
                      <span className="text-white/80">{formData.durationHours} Hours Playtime</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm font-medium">Total Cost</p>
                    <p className="font-black text-4xl drop-shadow-md">${totalPrice}</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isDisabled}
                  className="w-full bg-white text-blue-700 font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2 text-lg"
                >
                  {loading ? (
                    <span className="animate-pulse">Processing Booking...</span>
                  ) : (
                    "Confirm & Pay"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}