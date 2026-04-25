import { useState, useMemo } from "react";
import { useRental } from "../context/RentalContext";
import { CreditCard, Gamepad2, User, Clock, QrCode, Banknote, Wallet, Sparkles, CalendarClock, Phone, CheckCircle2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Reserve() {
  const { units, addBooking } = useRental();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [virtualAccount, setVirtualAccount] = useState("");

  const [formData, setFormData] = useState({
    unitId: "",
    customerName: "",
    phoneNumber: "", // 🔥 Field Baru
    startTime: "",
    durationHours: 1,
    paymentMethod: "" as "credit-card" | "debit-card" | "qr-payment" | "cash" | "e-wallet" | "",
  });

  const availableUnits = useMemo(() => units.filter((u) => u.status === "available"), [units]);
  const selectedUnit = useMemo(() => units.find((u) => u.id === formData.unitId), [units, formData.unitId]);
  const totalPrice = useMemo(() => (selectedUnit ? selectedUnit.pricePerHour * formData.durationHours : 0), [selectedUnit, formData.durationHours]);
  const minDateTime = new Date().toISOString().slice(0, 16);

  const generateVirtualAccount = () => {
    return "8801" + Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.unitId || !formData.customerName || !formData.phoneNumber || !formData.startTime || !formData.paymentMethod) {
      setErrorMsg("Harap lengkapi semua data, termasuk No. HP.");
      return;
    }

    try {
      setLoading(true);
      const start = new Date(formData.startTime);

      await addBooking({
        unitId: formData.unitId,
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber, // 🔥 Kirim No HP
        durationHours: formData.durationHours,
        totalCost: totalPrice,
        startTime: start.toISOString(),
        paymentMethod: formData.paymentMethod,
      });

      // Buat referensi struk dan kode pembayaran
      setBookingRef("ORD-" + Math.random().toString(36).substring(2, 8).toUpperCase());
      if (["credit-card", "debit-card", "e-wallet"].includes(formData.paymentMethod)) {
        setVirtualAccount(generateVirtualAccount());
      }

      // Transisi ke UI Struk
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menyimpan reservasi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !formData.unitId || !formData.customerName || !formData.phoneNumber || !formData.startTime || !formData.paymentMethod || loading;

  const paymentOptions = [
    { key: "credit-card", icon: CreditCard, label: "Credit Card" },
    { key: "debit-card", icon: CreditCard, label: "Debit Card" },
    { key: "qr-payment", icon: QrCode, label: "QRIS / QR" },
    { key: "e-wallet", icon: Wallet, label: "E-Wallet" },
    { key: "cash", icon: Banknote, label: "Cash" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kode disalin ke clipboard!");
  };

  // ==========================================
  // UI STRUK & INSTRUKSI PEMBAYARAN
  // ==========================================
  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Header Struk */}
          <div className="text-center space-y-2 mb-8 relative z-10">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Booking Berhasil!</h2>
            <p className="text-slate-500 text-sm">Selesaikan pembayaran untuk mulai bermain.</p>
          </div>

          {/* Instruksi Pembayaran Dinamis */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700">
            {formData.paymentMethod === "qr-payment" && (
              <div className="text-center space-y-4">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Scan QRIS di bawah ini</p>
                <div className="bg-white p-2 rounded-xl shadow-sm inline-block border-2 border-dashed border-slate-300">
                  {/* 🔥 Memanggil gambar qris.jpeg dari folder public */}
                  <img src="/qris.jpeg" alt="QRIS Payment" className="w-48 h-auto rounded-lg" />
                </div>
                <p className="text-xs text-slate-500">Atas Nama: PlayZone Rental</p>
              </div>
            )}

            {["credit-card", "debit-card", "e-wallet"].includes(formData.paymentMethod) && (
              <div className="text-center space-y-3">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Kode Pembayaran / Virtual Account</p>
                <div className="bg-white dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-mono font-black text-xl text-blue-600 tracking-wider">{virtualAccount}</span>
                  <button onClick={() => copyToClipboard(virtualAccount)} className="text-slate-400 hover:text-blue-500 transition-colors">
                    <Copy size={20} />
                  </button>
                </div>
                <p className="text-xs text-slate-500">Salin kode di atas ke aplikasi pembayaran Anda.</p>
              </div>
            )}

            {formData.paymentMethod === "cash" && (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
                  <Banknote size={24} />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Pembayaran di Kasir</p>
                <p className="text-sm text-slate-500">Silakan tunjukkan struk ini ke kasir/admin di lokasi untuk membayar dengan uang tunai.</p>
              </div>
            )}
          </div>

          {/* Struk Details */}
          <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-700 pt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Booking Ref</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{bookingRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nama</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formData.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">No. HP</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formData.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Console</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selectedUnit?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Durasi</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formData.durationHours} Jam</span>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center mt-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">Total Tagihan</span>
              <span className="font-black text-xl text-blue-600">${totalPrice}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/my-rentals")}
          className="w-full bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          Selesai & Lihat Rental Saya
        </button>
      </div>
    );
  }

  // ==========================================
  // UI FORM RESERVASI (AWAL)
  // ==========================================
  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">New Reservation</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Isi data dan pilih konsol Anda.</p>
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

            {/* PHONE NUMBER 🔥 */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-teal-500/10 text-teal-600 rounded-lg"><Phone size={18} /></div>
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData((p) => ({ ...p, phoneNumber: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus:ring-4 focus:ring-teal-500/20 outline-none"
                placeholder="08123456789"
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
                className="w-full accent-blue-600 mt-3"
              />
            </div>
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
                      ? "border-blue-500 bg-blue-500/10 text-blue-700 shadow-inner ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-white/50 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  <p.icon size={24} />
                  <span className="text-[10px] font-bold mt-2 uppercase text-center">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-lg">{errorMsg}</div>}
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
                  <p className="text-blue-100 text-sm">Total Tagihan</p>
                  <p className="font-black text-4xl">${totalPrice}</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={isDisabled}
                className="w-full bg-white text-blue-700 font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Memproses..." : "Konfirmasi & Bayar"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}