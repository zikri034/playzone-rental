import { useState, useMemo } from "react";
import { useRental } from "../context/RentalContext";
import { CreditCard, Gamepad2, User, Clock, QrCode, Banknote, Wallet, Sparkles, CalendarClock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
// import { supabase } from "../../utils/supabase/client"; // Kita tidak butuh ini lagi di sini karena sudah dihandle Context

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

      // Konversi string input ke objek Date untuk perhitungan, lalu kirim sebagai ISO String
      const start = new Date(formData.startTime);

      // 🔥 Kita serahkan logika INSERT ke addBooking agar terpusat di RentalContext
      await addBooking({
        unitId: formData.unitId,
        customerName: formData.customerName,
        durationHours: formData.durationHours,
        totalCost: totalPrice,
        startTime: start.toISOString(), // ✅ FIX: Sekarang kirim string, bukan objek Date
        paymentMethod: formData.paymentMethod,
      });

      navigate("/my-rentals");
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong with the connection.");
    } finally {
      setLoading(false); 
    }
  };

  // ... sisa kode UI (isDisabled, paymentOptions, return JSX) tetap sama ...
  const isDisabled = !formData.unitId || !formData.customerName || !formData.startTime || !formData.paymentMethod || loading;

  const paymentOptions = [
    { key: "credit-card", icon: CreditCard, label: "Credit Card" },
    { key: "debit-card", icon: CreditCard, label: "Debit Card" },
    { key: "qr-payment", icon: QrCode, label: "QRIS / QR" },
    { key: "e-wallet", icon: Wallet, label: "E-Wallet" },
    { key: "cash", icon: Banknote, label: "Cash" },
  ];

  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">New Reservation</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Book your console and secure your playtime.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-slate-700 shadow-sm space-y-8">
          
          {/* SELECT CONSOLE */}
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg"><Gamepad2 size={18} /></div> 
              Select Console
            </label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {availableUnits.map((unit) => (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, unitId: unit.id }))}
                  className={`relative text-left p-4 rounded-2xl border transition-all duration-300 ${
                    formData.unitId === unit.id
                      ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-blue-300"
                  }`}
                >
                  <p className="font-black text-lg text-slate-800 dark:text-slate-200">{unit.name}</p>
                  <p className="text-xs font-medium text-slate-500">{unit.type}</p>
                  <p className="text-sm font-bold text-blue-600 mt-2">${unit.pricePerHour}/hr</p>
                </button>
              ))}
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
                value={formData.customerName}
                onChange={(e) => setFormData((p) => ({ ...p, customerName: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none"
                placeholder="John Doe"
              />
            </div>

            {/* TIME */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-pink-500/10 text-pink-600 rounded-lg"><CalendarClock size={18} /></div>
                Schedule Playtime
              </label>
              <input
                type="datetime-local"
                min={minDateTime}
                value={formData.startTime}
                onChange={(e) => setFormData((p) => ({ ...p, startTime: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>

          {/* DURATION */}
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg"><Clock size={18} /></div>
              Duration ({formData.durationHours} Hours)
            </label>
            <input
              type="range"
              min="1"
              max="12"
              value={formData.durationHours}
              onChange={(e) => setFormData((p) => ({ ...p, durationHours: Number(e.target.value) }))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* PAYMENT */}
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-orange-500/10 text-orange-600 rounded-lg"><CreditCard size={18} /></div>
              Payment Method
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {paymentOptions.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: p.key as any }))}
                  className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
                    formData.paymentMethod === p.key
                      ? "border-blue-500 bg-blue-500/10 text-blue-700"
                      : "border-slate-200 bg-white/50 text-slate-600"
                  }`}
                >
                  <p.icon size={24} />
                  <span className="text-[10px] font-bold mt-2 uppercase">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && <div className="text-red-500 text-sm font-bold text-center">{errorMsg}</div>}
        </div>

        {/* SUMMARY & SUBMIT */}
        <AnimatePresence>
          {formData.unitId && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-xl"
            >
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="font-black text-2xl">{selectedUnit?.name}</p>
                  <p className="text-blue-100 text-sm">{formData.durationHours} Hours Playtime</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Total Cost</p>
                  <p className="font-black text-4xl">${totalPrice}</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={isDisabled}
                className="w-full bg-white text-blue-700 font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm & Pay"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}